const Rfp = require("../models/rfp");
const Vendor = require("../models/vendor");
const Proposal = require("../models/proposal");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

async function generateStructuredRfp(req, res) {
  const { description, title } = req.body;

  if (!description) {
    return res.status(400).json({
      success: false,
      message: "description is required",
    });
  }

  try {
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const prompt = `
Given the following RFP description, extract a structured object with this schema:

{
  "title": string,
  "budget": number | null,
  "deliveryDays": number | null,
  "paymentTerms": string | null,
  "warranty": string | null,
  "lineItems": [
    {
      "name": string,
      "quantity": number,
      "spec": string
    }
  ]
}

Rules:
- If a field is not mentioned, use null or empty array.
- "budget" must be a number only (no currency symbol).
- "deliveryDays" is an integer number of days.
- "paymentTerms" and "warranty" are short human-readable strings.
- "lineItems" must be an array. If multiple items, separate them.
- Return ONLY valid JSON, no explanation, no markdown.

RFP description:
---
${description}
---
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const aiContent = (response.text || "").trim() || "{}";
    let structured;
    try {
      structured = JSON.parse(aiContent);
    } catch (e) {
      console.error("Failed to parse Gemini JSON:", aiContent, e);
      return res.status(502).json({
        success: false,
        message: "Failed to parse AI response as JSON",
      });
    }

    const finalTitle = structured.title || title || "Untitled RFP";
    const budget = structured.budget ?? null;
    const deliveryDays = structured.deliveryDays ?? null;
    const paymentTerms = structured.paymentTerms || null;
    const warranty = structured.warranty || null;
    const lineItems = Array.isArray(structured.lineItems)
      ? structured.lineItems
      : [];

    const summaryParts = [];

    summaryParts.push(`Title detected: "${finalTitle}".`);

    if (budget !== null) {
      summaryParts.push(`Estimated budget: ${budget}.`);
    } else {
      summaryParts.push("No explicit budget detected.");
    }

    if (deliveryDays !== null) {
      summaryParts.push(`Requested delivery timeline: ${deliveryDays} days.`);
    } else {
      summaryParts.push("No explicit delivery timeline detected.");
    }

    if (paymentTerms) {
      summaryParts.push(`Payment terms: ${paymentTerms}.`);
    } else {
      summaryParts.push("No specific payment terms detected.");
    }

    if (warranty) {
      summaryParts.push(`Warranty requested: ${warranty}.`);
    } else {
      summaryParts.push("No specific warranty information detected.");
    }

    if (lineItems.length > 0) {
      const itemsSummary = lineItems
        .map(
          (item, index) =>
            `${index + 1}. ${item.quantity} x ${item.name} (${item.spec})`
        )
        .join(" ");
      summaryParts.push(`Line items detected: ${itemsSummary}`);
    } else {
      summaryParts.push("No clear line items detected in the description.");
    }

    const humanReadableSummary = summaryParts.join(" ");

    return res.status(200).json({
      success: true,
      message: "Structured RFP generated from description (Gemini 2.5)",
      data: {
        descriptionNlp: description,
        title: finalTitle,
        budget,
        deliveryDays,
        paymentTerms,
        warranty,
        lineItems,
        summary: humanReadableSummary,
      },
      raw: structured,
    });
  } catch (error) {
    console.error("Error in generateStructuredRfp with Gemini:", error);

    if (error.status === 429) {
      return res.status(429).json({
        success: false,
        message:
          "RFP generation is temporarily unavailable due to Gemini quota/rate limits.",
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error while generating RFP",
      error: error.message,
    });
  }
}

async function submitRfp(req, res) {
  try {
    const {
      title,
      descriptionNlp,
      budget,
      deliveryDays,
      paymentTerms,
      warranty,
      lineItems,
    } = req.body;

    if (!title || !descriptionNlp) {
      return res.status(400).json({
        success: false,
        message: "title and descriptionNlp are required",
      });
    }

    const rfpDoc = await Rfp.create({
      title,
      descriptionNlp,
      budget: budget ?? null,
      deliveryDays: deliveryDays ?? null,
      paymentTerms: paymentTerms || null,
      warranty: warranty || null,
      lineItems: Array.isArray(lineItems) ? lineItems : [],
      invitedVendors: [],
    });

    return res.status(201).json({
      success: true,
      message: "RFP created successfully",
      data: rfpDoc,
    });
  } catch (error) {
    console.error("Error in submitRfp:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while creating RFP",
      error: error.message,
    });
  }
}

async function removeRfp(req, res) {
  const { id } = req.params;

  try {
    const removedRfp = await Rfp.findByIdAndDelete(id);

    if (!removedRfp) {
      return res.status(404).json({
        success: false,
        message: "RFP not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "RFP deleted successfully",
      data: removedRfp, // optional: can help you debug
    });
  } catch (err) {
    console.error("Error in removeRfp:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to delete RFP",
      error: err.message, // use err, not error
    });
  }
}

async function getRfpById(req, res) {
  try {
    const { id } = req.params;

    const rfp = await Rfp.findById(id).populate(
      "invitedVendors.vendor",
      "name email phone"
    );

    if (!rfp) {
      return res.status(404).json({
        success: false,
        message: "RFP not found",
      });
    }

    const proposals = await Proposal.find({ rfp: id })
      .populate("vendor", "name email phone")
      .sort({ createdAt: -1 });

    // ---------- 1) Build input for AI (if we still want Gemini) ----------
    const aiInputProposals = proposals.map((p) => ({
      id: p._id.toString(),
      vendorName: p.vendor?.name,
      vendorEmail: p.vendor?.email,
      totalPrice: p.totalPrice,
      deliveryDays: p.deliveryDays,
      paymentTerms: p.paymentTerms,
      warranty: p.warranty,
      scoreOverall: p.scoreOverall,
    }));

    // ---------- 2) Default recommendations: based on scoreOverall ----------
    let aiRecommendations = [];

    if (proposals.length > 0) {
      // Filter proposals that have a numeric scoreOverall
      const scoredProposals = proposals.filter(
        (p) => typeof p.scoreOverall === "number"
      );

      // If no scoreOverall present, we can still rank by some fallback (e.g. lower price)
      const baseList =
        scoredProposals.length > 0 ? scoredProposals : proposals;

      // Sort DESC by scoreOverall (or treat missing as 0)
      const sortedByScore = [...baseList].sort((a, b) => {
        const aScore = typeof a.scoreOverall === "number" ? a.scoreOverall : 0;
        const bScore = typeof b.scoreOverall === "number" ? b.scoreOverall : 0;
        return bScore - aScore;
      });

      aiRecommendations = sortedByScore.map((p, index) => ({
        proposalId: p._id.toString(),
        rank: index + 1, // 1 = best
        // If your scoreOverall is already 0–1, keep as is.
        // If it’s 0–100, you can normalize here: p.scoreOverall / 100.
        overallScore:
          typeof p.scoreOverall === "number" ? p.scoreOverall : 0,
        reason:
          "Ranked based on internal overall score (higher overall score = better).",
      }));
    }

    // ---------- 3) Optional: try Gemini to refine ranking ----------
    if (aiInputProposals.length > 0) {
      try {
        const { GoogleGenAI } = await import("@google/genai");
        const ai = new GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY,
        });

        const prompt = `
You are helping a procurement manager choose the best proposal for an RFP.

RFP details (JSON):
${JSON.stringify({
  title: rfp.title,
  descriptionNlp: rfp.descriptionNlp,
  budget: rfp.budget,
  deliveryDays: rfp.deliveryDays,
  paymentTerms: rfp.paymentTerms,
  warranty: rfp.warranty,
  lineItems: rfp.lineItems,
})}

Proposals (JSON array):
${JSON.stringify(aiInputProposals)}

Consider:
- Price (within or under budget is better)
- Delivery days (faster is better)
- Payment terms (more favourable to buyer is better)
- Warranty (longer / better coverage is better)
- scoreOverall field (higher is better)
- Any extra useful info from parsedJson if present

Return ONLY valid JSON in this format, sorted best → worst:

{
  "recommendations": [
    {
      "proposalId": "<id from proposals array>",
      "rank": 1,
      "overallScore": 0.0,   // between 0 and 1 as AI assessment
      "reason": "short explanation why this ranking"
    }
  ]
}
        `.trim();

        const result = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
        });

        const text = result.response.text().trim();

        try {
          const parsed = JSON.parse(text);
          if (parsed && Array.isArray(parsed.recommendations)) {
            // ✅ Override score-based recommendations with Gemini ones
            aiRecommendations = parsed.recommendations;
          } else {
            console.warn("Gemini response missing recommendations array");
          }
        } catch (parseErr) {
          console.error("Failed to parse Gemini JSON:", parseErr, "raw:", text);
          // Keep score-based aiRecommendations as fallback
        }
      } catch (aiErr) {
        console.error("Error calling Gemini for proposal ranking:", aiErr);
        // Keep score-based aiRecommendations as fallback
      }
    }

    // ---------- 4) Return RFP + proposals + recommendations ----------
    return res.status(200).json({
      success: true,
      data: {
        rfp,
        proposals,
        recommendations: aiRecommendations,
      },
    });
  } catch (error) {
    console.error("Error in getRfpById:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching RFP",
      error: error.message,
    });
  }
}

async function getRfpList(req,res){
   try {
    const rfps = await Rfp.aggregate([
      {
        $lookup: {
          from: "proposals",        // collection name for Proposal
          localField: "_id",
          foreignField: "rfp",
          as: "proposals",
        },
      },
      {
        $addFields: {
          proposalCount: { $size: "$proposals" },
        },
      },
      {
        $project: {
          proposals: 0, // don’t send full proposals, only count
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    return res.json({
      success: true,
      data: rfps, // each rfp has .proposalCount
    });
  } catch (err) {
    console.error("Error in listRfpsWithProposalCount:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching RFPs",
    });
  }
}

module.exports = { generateStructuredRfp, submitRfp, removeRfp,getRfpById,getRfpList };
