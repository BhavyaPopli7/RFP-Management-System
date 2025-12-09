const Rfp = require("../models/rfp");
const Vendor = require("../models/vendor");
const Proposal = require("../models/proposal");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

async function inviteVendorsToRfp(req, res) {
  const { id } = req.params;
  const { vendorIds } = req.body;

  if (!Array.isArray(vendorIds) || vendorIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: "vendorIds array is required",
    });
  }

  try {
    // 1) Load RFP
    const rfp = await Rfp.findById(id);
    if (!rfp) {
      return res.status(404).json({
        success: false,
        message: "RFP not found",
      });
    }

    // 2) Load vendors
    const vendors = await Vendor.find({ _id: { $in: vendorIds } });
    if (vendors.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No vendors found for given IDs",
      });
    }

    // 3) Setup email transporter
    const transporter = createTransporter();

    // 4) Setup Gemini client
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    async function generateEmailForVendor(vendor) {
      const lineItemsText = rfp.lineItems
        .map(
          (item, index) =>
            `${index + 1}. ${item.quantity} x ${item.name} (${item.spec})`
        )
        .join("\n");

      const prompt = `
You are an assistant helping a procurement manager invite vendors to respond to an RFP.

Write a professional email to a vendor about the following RFP.

Vendor:
- Name: ${vendor.name}
- Email: ${vendor.email}

RFP details:
- Title: ${rfp.title}
- Budget: ${rfp.budget || "Not specified"}
- Delivery timeline (days): ${rfp.deliveryDays || "Not specified"}
- Payment terms: ${rfp.paymentTerms || "Not specified"}
- Warranty: ${rfp.warranty || "Not specified"}

Line items:
${lineItemsText || "No specific line items listed."}

Guidelines for the email:
- Start with a greeting addressing the vendor by name.
- Briefly describe the purpose of the RFP.
- Summarize the key requirements (budget range, delivery timeline, main items).
- Invite the vendor to submit a quote / proposal and mention preferred response timeline is within 5–7 working days.
- Keep the tone polite, clear, and concise.
- Do NOT include any markdown or bullet symbols like '*', just plain text lines.
- Include a clear subject line on the first line in the format: "Subject: ...".
- After a blank line, write the email body.
`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      return (response.text || "").trim();
    }

    const results = [];

    for (const vendor of vendors) {
      const emailText = await generateEmailForVendor(vendor);

      const lines = emailText.split("\n");
      let subject = "RFP Invitation";
      let body = emailText;

      if (lines[0].toLowerCase().startsWith("subject:")) {
        subject = lines[0].slice("subject:".length).trim();
        body = lines.slice(2).join("\n"); // skip subject + blank line
      }

      const subjectTag = `[RFP:${rfp._id}][VENDOR:${vendor._id}]`;
      subject = `${subjectTag} ${subject}`;

      const submitUrl = `${process.env.CLIENT_URL}/proposal/submit?rfpId=${rfp._id}&vendorId=${vendor._id}`;
      body += `You can submit your detailed proposal using this link:${submitUrl}`;

      // Send email
      await transporter.sendMail({
        from: process.env.FROM_EMAIL,
        to: vendor.email,
        subject,
        text: body,
      });

      // Update invitedVendors in the RFP
      const existing = rfp.invitedVendors.find(
        (iv) => iv.vendor.toString() === vendor._id.toString()
      );

      if (existing) {
        existing.status = "SENT";
        existing.sentAt = new Date();
      } else {
        rfp.invitedVendors.push({
          vendor: vendor._id,
          status: "SENT",
          sentAt: new Date(),
        });
      }

      results.push({
        vendorId: vendor._id,
        email: vendor.email,
        status: "SENT",
      });
    }

    await rfp.save();

    return res.status(200).json({
      success: true,
      message: "RFP email sent to selected vendors",
      data: {
        rfpId: rfp._id,
        invitedVendors: results,
      },
    });
  } catch (error) {
    console.error("Error in inviteVendorsToRfp:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while inviting vendors",
      error: error.message,
    });
  }
}

async function createProposalFromEmail(req, res) {
  const { rfpId, vendorId } = req.params;
  const { subject, text, html } = req.body;

  const rawEmail = text || html || "";

  if (!rawEmail.trim()) {
    return res.status(400).json({
      success: false,
      message: "Email body (text or html) is required",
    });
  }

  try {
    // 1) Load RFP and Vendor
    const [rfp, vendor] = await Promise.all([
      Rfp.findById(rfpId),
      Vendor.findById(vendorId),
    ]);

    if (!rfp) {
      return res.status(404).json({
        success: false,
        message: "RFP not found",
      });
    }

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    // 2) Setup Gemini client
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    // 3) Build prompt for AI
    const lineItemsText = (rfp.lineItems || [])
      .map(
        (item, index) =>
          `${index + 1}. ${item.quantity} x ${item.name} (${item.spec})`
      )
      .join("\n");

    const prompt = `
You are an assistant that reads vendor email replies to an RFP and extracts a structured commercial proposal.

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

Line items (formatted):
${lineItemsText || "No specific line items listed."}

Vendor:
- Name: ${vendor.name}
- Email: ${vendor.email}

Vendor email subject:
${subject || "(no subject)"}

Vendor email body:
---
${rawEmail}
---

Your task:
- Understand the vendor's quote from this email.
- Extract prices, delivery timeline, payment terms, warranty, and line item level prices if possible.
- Also provide an overall AI evaluation score relative to the RFP (budget, delivery days, terms, warranty).

Return ONLY valid JSON with this exact schema:

{
  "totalPrice": number | null,
  "currency": string | null,
  "deliveryDays": number | null,
  "paymentTerms": string | null,
  "warranty": string | null,
  "lineItems": [
    {
      "name": string,
      "quantity": number | null,
      "spec": string | null,
      "unitPrice": number | null,
      "totalPrice": number | null
    }
  ],
  "scoreOverall": number | null,       // between 0 and 100
  "scoreBreakdown": {
    "price": number | null,
    "delivery": number | null,
    "terms": number | null,
    "warranty": number | null
  },
  "summary": string
}
`.trim();

    // 4) Call Gemini in JSON mode
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      // IMPORTANT: force raw JSON
      config: {
        responseMimeType: "application/json",
      },
    });

    // With @google/genai, text is on response.text (NOT response.response.text())
    let aiText = (response.text || "").trim();

    console.log("Gemini proposal raw text:", aiText);

    // Strip ```json ... ``` or ``` ... ``` fences if any
    if (aiText.startsWith("```")) {
      aiText = aiText
        .replace(/^```json/i, "")
        .replace(/^```/, "")
        .replace(/```$/, "")
        .trim();
    }

    // Extra safety: keep only the first {...} block if Gemini still adds noise
    if (!aiText.startsWith("{")) {
      const firstBrace = aiText.indexOf("{");
      const lastBrace = aiText.lastIndexOf("}");
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        aiText = aiText.slice(firstBrace, lastBrace + 1);
      }
    }

    let structured;
    try {
      structured = JSON.parse(aiText);
    } catch (e) {
      console.error("Failed to parse Gemini JSON for proposal:", aiText, e);
      return res.status(502).json({
        success: false,
        message: "Failed to parse AI response as JSON for proposal",
      });
    }

    // 5) Map AI result to Proposal schema
    const proposalData = {
      rfp: rfp._id,
      vendor: vendor._id,
      rawEmail: rawEmail,
      parsedJson: structured,
      totalPrice:
        typeof structured.totalPrice === "number"
          ? structured.totalPrice
          : null,
      deliveryDays:
        typeof structured.deliveryDays === "number"
          ? structured.deliveryDays
          : null,
      paymentTerms: structured.paymentTerms || null,
      warranty: structured.warranty || null,
      scoreOverall:
        typeof structured.scoreOverall === "number"
          ? structured.scoreOverall
          : null,
      scoreBreakdown: structured.scoreBreakdown || null,
      aiSummary: structured.summary || null,
    };

    // 6) Upsert Proposal (unique index {rfp, vendor})
    const proposal = await Proposal.findOneAndUpdate(
      { rfp: rfp._id, vendor: vendor._id },
      { $set: proposalData },
      { new: true, upsert: true }
    );

    // 7) Mark vendor as RESPONDED in RFP
    const existingInvite = rfp.invitedVendors.find(
      (iv) => iv.vendor.toString() === vendor._id.toString()
    );

    if (existingInvite) {
      existingInvite.status = "RESPONDED";
    } else {
      rfp.invitedVendors.push({
        vendor: vendor._id,
        status: "RESPONDED",
        sentAt: new Date(),
      });
    }

    await rfp.save();

    return res.status(200).json({
      success: true,
      message: "Proposal created/updated from vendor email",
      data: {
        rfpId: rfp._id,
        vendorId: vendor._id,
        proposal,
      },
    });
  } catch (error) {
    console.error("Error in createProposalFromEmail:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while creating proposal from email",
      error: error.message,
    });
  }
}

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false, 
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

module.exports = {inviteVendorsToRfp,createProposalFromEmail};