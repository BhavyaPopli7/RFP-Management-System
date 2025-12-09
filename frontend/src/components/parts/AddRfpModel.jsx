import React, { useState } from "react";
import toast from "react-hot-toast";

const AddRfpModal = ({ onClose }) => {
  const [description, setDescription] = useState("");
  const [summary, setSummary] = useState("");
  const [generatedData, setGeneratedData] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const hasGenerated = !!summary; 

  const handleGenerate = async () => {
    if (!description.trim()) {
      setError("Please enter a description before generating.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:4000/api/generate/rfp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to generate structured RFP");
      }

      const data = json.data || {};
      setGeneratedData(data);
      setSummary(data.summary || ""); 
    } catch (err) {
      console.error("Error generating RFP:", err);
      setError(err.message || "Something went wrong while generating.");
    } finally {
      setLoading(false);
    }
  };

const handleSubmit = async () => {
  if (!generatedData) {
    setError("Please generate the structured RFP before submitting.");
    return;
  }

  setLoading(true);
  setError("");

  try {
    const payload = {
      title: generatedData.title,
      descriptionNlp: generatedData.descriptionNlp,
      budget: generatedData.budget,
      deliveryDays: generatedData.deliveryDays,
      paymentTerms: generatedData.paymentTerms,
      warranty: generatedData.warranty,
      lineItems: generatedData.lineItems || [],
    };

    const res = await fetch("http://localhost:4000/api/submit/rfp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const json = await res.json();

    if (!res.ok || !json.success) {
      throw new Error(json.message || "Failed to submit RFP");
    }
    onClose();
    toast.success("Rfp added successfully");
  } catch (err) {
    console.error("Error in submitting RFP:", err);
    setError(err.message || "Something went wrong while submitting.");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-4xl rounded-xl bg-slate-900 border border-slate-700 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-slate-100">
            Add RFP
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-sm"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Left: Description textarea */}
            <div className="flex flex-col">
              <label className="mb-1 text-xs font-medium text-slate-300">
                Description
              </label>
              <textarea
                className="min-h-[180px] resize-none rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Describe what you want to procure..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Right: Read-only Summary textarea */}
            <div className="flex flex-col">
              <label className="mb-1 text-xs font-medium text-slate-300">
                Generated Summary (read-only)
              </label>
              <textarea
                className="min-h-[180px] resize-none rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-300 focus:outline-none"
                value={summary}
                readOnly
                placeholder="Summary will appear here after generation."
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="mt-3 text-sm text-red-400">
              {error}
            </p>
          )}

          {/* Buttons */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              className="inline-flex items-center rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-emerald-300"
            >
              {loading ? "Generating..." : "Generate Structured Format"}
            </button>

            {/* Submit button only visible after at least one successful generation */}
            {hasGenerated && (
              <button
                type="button"
                onClick={handleSubmit}
                className="inline-flex items-center rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                Submit RFP
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddRfpModal;
