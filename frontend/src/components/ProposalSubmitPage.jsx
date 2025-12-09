import { useSearchParams } from "react-router-dom";
import { useState } from "react";

export default function ProposalSubmitPage() {
  const [searchParams] = useSearchParams();
  const rfpId = searchParams.get("rfpId");
  const vendorId = searchParams.get("vendorId");

  const [message, setMessage] = useState("");  // like email body
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!rfpId || !vendorId) {
      setError("Missing RFP or Vendor ID in link.");
      return;
    }
    if (!message.trim()) {
      setError("Please enter your proposal details.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch(`http://localhost:4000/api/rfp/${rfpId}/vendor/${vendorId}/proposal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: "Proposal submission via portal",
          text: message,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to submit proposal");
      }

      setSuccessMsg("Thank you! Your proposal has been submitted.");
      setMessage("");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl rounded-xl bg-slate-900 border border-slate-700 p-6 shadow-lg">
        <h1 className="text-xl font-semibold mb-4">Submit Your Proposal</h1>

        {!rfpId || !vendorId ? (
          <p className="text-red-400 text-sm">
            Invalid or incomplete link. Please contact the buyer.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-slate-300">
              Please provide your commercial offer, including prices, delivery
              timeline, payment terms, and warranty details.
            </p>

            <label className="block text-xs font-medium text-slate-300">
              Proposal Details
            </label>
            <textarea
              className="w-full min-h-[200px] rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Type your proposal here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />

            {error && <p className="text-sm text-red-400">{error}</p>}
            {successMsg && (
              <p className="text-sm text-emerald-400">{successMsg}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-emerald-400 disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit Proposal"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
