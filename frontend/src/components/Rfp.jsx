import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

const Rfp = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [rfp, setRfp] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Vendors for inviting
  const [vendors, setVendors] = useState([]);
  const [vendorsLoading, setVendorsLoading] = useState(true);
  const [vendorsError, setVendorsError] = useState("");
  const [selectedVendorIds, setSelectedVendorIds] = useState([]);
  const [sending, setSending] = useState(false);

  // Selected proposal for details panel
  const [selectedProposal, setSelectedProposal] = useState(null);

  // For AI recommendation mapping
  const recMap = useMemo(() => {
    const map = {};
    recommendations.forEach((rec) => {
      if (rec.proposalId) {
        map[rec.proposalId] = rec;
      }
    });
    return map;
  }, [recommendations]);

  // Fetch RFP details
  useEffect(() => {
    const fetchRfpDetail = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`http://localhost:4000/api/getrfp/${id}`);
        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.message || "Failed to fetch RFP details");
        }

        const { rfp, proposals, recommendations } = json.data || {};
        setRfp(rfp || null);
        setProposals(proposals || []);
        setRecommendations(recommendations || []);
      } catch (err) {
        console.error("Error fetching RFP detail:", err);
        setError(err.message || "Something went wrong while fetching RFP");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRfpDetail();
    }
  }, [id]);

  // Fetch vendor list for inviting
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setVendorsLoading(true);
        setVendorsError("");

        const res = await fetch("http://localhost:4000/api/list/vendor");
        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.message || "Failed to fetch vendors");
        }

        setVendors(json.data || []);
      } catch (err) {
        console.error("Error fetching vendors:", err);
        setVendorsError(
          err.message || "Something went wrong while fetching vendors"
        );
      } finally {
        setVendorsLoading(false);
      }
    };

    fetchVendors();
  }, []);

  // IDs of vendors already invited to this RFP
  const invitedVendorIdsSet = useMemo(() => {
    if (!rfp || !rfp.invitedVendors) return new Set();
    return new Set(
      rfp.invitedVendors
        .map((iv) => iv.vendor && iv.vendor._id)
        .filter(Boolean)
    );
  }, [rfp]);

  // Vendors available to invite (not already invited)
  const availableVendors = useMemo(() => {
    return vendors.filter((v) => !invitedVendorIdsSet.has(v._id));
  }, [vendors, invitedVendorIdsSet]);

  const toggleVendorSelection = (vendorId) => {
    setSelectedVendorIds((prev) =>
      prev.includes(vendorId)
        ? prev.filter((id) => id !== vendorId)
        : [...prev, vendorId]
    );
  };

  const handleSendRfpToVendors = async () => {
    if (selectedVendorIds.length === 0) {
      alert("Please select at least one vendor to send the RFP to.");
      return;
    }

    try {
      setSending(true);

      const res = await fetch(
        `http://localhost:4000/api/rfp/${id}/invite-vendors`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ vendorIds: selectedVendorIds }),
        }
      );

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to send RFP to vendors");
      }

      if (json.data && json.data.rfp) {
        setRfp(json.data.rfp);
      }

      setSelectedVendorIds([]);
      toast.success("RFP sent to selected vendors successfully.");
      navigate(0);
    } catch (err) {
      console.error("Error sending RFP to vendors:", err);
      toast.error(err.message || "Something went wrong while sending RFP.");
    } finally {
      setSending(false);
    }
  };

  // Auto-select best proposal (rank 1) or fallback to first
  useEffect(() => {
    if (!proposals || proposals.length === 0) {
      setSelectedProposal(null);
      return;
    }

    if (recommendations && recommendations.length > 0) {
      const bestRec = recommendations.find((r) => r.rank === 1);
      if (bestRec) {
        const bestProposal = proposals.find(
          (p) => p._id?.toString() === bestRec.proposalId
        );
        if (bestProposal) {
          setSelectedProposal(bestProposal);
          return;
        }
      }
    }

    setSelectedProposal(proposals[0]);
  }, [proposals, recommendations]);

  // Loading view
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <header className="h-16 flex items-center px-6 border-b border-slate-800">
          <h1 className="text-xl font-semibold">RFP Detail</h1>
        </header>

        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 rounded-full border-2 border-slate-700 border-t-sky-400 animate-spin" />
            <p className="text-sm text-slate-300">Loading RFP Details...</p>
          </div>
        </main>
      </div>
    );
  }

  // Error / not found view
  if (error || !rfp) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <header className="h-16 flex items-center px-6 border-b border-slate-800">
          <h1 className="text-xl font-semibold">RFP Detail</h1>
        </header>
        <main className="p-6">
          {error ? (
            <p className="text-sm text-red-400 mb-4">{error}</p>
          ) : (
            <p className="text-sm text-red-400 mb-4">RFP not found.</p>
          )}
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center rounded-md bg-slate-700 px-3 py-1.5 text-sm font-medium text-slate-100 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            ← Back
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center rounded-md bg-slate-800 px-2 py-1 text-xs font-medium text-slate-200 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500"
          >
            ← Back
          </button>
          <h1 className="text-xl font-semibold">RFP Detail</h1>
        </div>
        <span className="text-xs text-slate-400">ID: {rfp._id}</span>
      </header>

      {/* Main content */}
      <main className="p-6 space-y-6">
        {/* Top summary card */}
        <section className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2 rounded-lg border border-slate-800 bg-slate-900 p-4">
            <h2 className="text-lg font-semibold mb-2">{rfp.title}</h2>
            <p className="text-sm text-slate-300 whitespace-pre-line">
              {rfp.descriptionNlp}
            </p>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-900 p-4 space-y-2 text-sm">
            <h3 className="text-sm font-semibold text-slate-200 mb-1">
              Summary
            </h3>
            <div className="flex justify-between">
              <span className="text-slate-400">Budget:</span>
              <span className="text-slate-100">
                {rfp.budget != null ? `$${rfp.budget}` : "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Delivery Days:</span>
              <span className="text-slate-100">
                {rfp.deliveryDays != null ? `${rfp.deliveryDays} days` : "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Payment Terms:</span>
              <span className="text-slate-100">{rfp.paymentTerms || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Warranty:</span>
              <span className="text-slate-100">{rfp.warranty || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Created At:</span>
              <span className="text-slate-100">
                {new Date(rfp.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        </section>

        {/* Line items */}
        <section className="rounded-lg border border-slate-800 bg-slate-900 p-4">
          <h3 className="text-sm font-semibold text-slate-200 mb-3">
            Line Items
          </h3>
          {!rfp.lineItems || rfp.lineItems.length === 0 ? (
            <p className="text-sm text-slate-400">
              No line items defined for this RFP.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-800">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-slate-300 border-b border-slate-700">
                      S.No
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-300 border-b border-slate-700">
                      Name
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-300 border-b border-slate-700">
                      Quantity
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-300 border-b border-slate-700">
                      Spec
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rfp.lineItems.map((item, index) => (
                    <tr
                      key={`${item.name}-${index}`}
                      className="hover:bg-slate-800"
                    >
                      <td className="px-3 py-2 border-b border-slate-800 text-slate-200">
                        {index + 1}
                      </td>
                      <td className="px-3 py-2 border-b border-slate-800 text-slate-100">
                        {item.name}
                      </td>
                      <td className="px-3 py-2 border-b border-slate-800 text-slate-100">
                        {item.quantity}
                      </td>
                      <td className="px-3 py-2 border-b border-slate-800 text-slate-300">
                        {item.spec}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Invited vendors */}
        <section className="rounded-lg border border-slate-800 bg-slate-900 p-4">
          <h3 className="text-sm font-semibold text-slate-200 mb-3">
            Invited Vendors
          </h3>
          {!rfp.invitedVendors || rfp.invitedVendors.length === 0 ? (
            <p className="text-sm text-slate-400">
              No vendors have been invited for this RFP yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-800">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-slate-300 border-b border-slate-700">
                      Vendor
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-300 border-b border-slate-700">
                      Status
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-300 border-b border-slate-700">
                      Sent At
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rfp.invitedVendors.map((iv, index) => (
                    <tr key={index} className="hover:bg-slate-800">
                      <td className="px-3 py-2 border-b border-slate-800 text-slate-100">
                        {iv.vendor?.name || "Unknown"}
                        <div className="text-xs text-slate-400">
                          {iv.vendor?.email}
                        </div>
                      </td>
                      <td className="px-3 py-2 border-b border-slate-800 text-slate-300">
                        {iv.status}
                      </td>
                      <td className="px-3 py-2 border-b border-slate-800 text-slate-300">
                        {iv.sentAt
                          ? new Date(iv.sentAt).toLocaleString()
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Invite vendors (checkbox list) */}
        <section className="rounded-lg border border-slate-800 bg-slate-900 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-200">
              Invite Vendors
            </h3>
            {vendorsLoading && (
              <span className="text-xs text-slate-400">
                Loading vendors...
              </span>
            )}
          </div>

          {vendorsError && (
            <p className="text-sm text-red-400 mb-2">{vendorsError}</p>
          )}

          {availableVendors.length === 0 && !vendorsLoading ? (
            <p className="text-sm text-slate-400">
              No additional vendors available to invite.
            </p>
          ) : (
            <div className="max-h-64 overflow-y-auto border border-slate-800 rounded-md">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-800">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-slate-300 border-b border-slate-700">
                      Select
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-300 border-b border-slate-700">
                      Name
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-300 border-b border-slate-700">
                      Email
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-300 border-b border-slate-700">
                      Phone
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {availableVendors.map((v) => (
                    <tr key={v._id} className="hover:bg-slate-800">
                      <td className="px-3 py-2 border-b border-slate-800">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                          checked={selectedVendorIds.includes(v._id)}
                          onChange={() => toggleVendorSelection(v._id)}
                        />
                      </td>
                      <td className="px-3 py-2 border-b border-slate-800 text-slate-100">
                        {v.name}
                      </td>
                      <td className="px-3 py-2 border-b border-slate-800 text-slate-300">
                        {v.email}
                      </td>
                      <td className="px-3 py-2 border-b border-slate-800 text-slate-300">
                        {v.phone || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={handleSendRfpToVendors}
              disabled={sending || selectedVendorIds.length === 0}
              className="inline-flex items-center rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-emerald-300"
            >
              {sending ? "Sending..." : "Send RFP to Selected Vendors"}
            </button>
          </div>
        </section>

        {/* Proposals + recommendations + details panel */}
        <section className="rounded-lg border border-slate-800 bg-slate-900 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-200">Proposals</h3>
            <span className="text-xs text-slate-400">
              Total: {proposals.length}
            </span>
          </div>

          {proposals.length === 0 ? (
            <p className="text-sm text-slate-400">
              No proposals submitted yet for this RFP.
            </p>
          ) : (
            <div className="grid gap-4 lg:grid-cols-[2fr,1.5fr]">
              {/* Table on the left */}
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-800">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-slate-300 border-b border-slate-700">
                        Vendor
                      </th>
                      <th className="px-3 py-2 text-left font-semibold text-slate-300 border-b border-slate-700">
                        Total Price
                      </th>
                      <th className="px-3 py-2 text-left font-semibold text-slate-300 border-b border-slate-700">
                        Delivery Days
                      </th>
                      <th className="px-3 py-2 text-left font-semibold text-slate-300 border-b border-slate-700">
                        Payment Terms
                      </th>
                      <th className="px-3 py-2 text-left font-semibold text-slate-300 border-b border-slate-700">
                        Warranty
                      </th>
                      <th className="px-3 py-2 text-left font-semibold text-slate-300 border-b border-slate-700">
                        AI Rank / Reason
                      </th>
                      <th className="px-3 py-2 text-left font-semibold text-slate-300 border-b border-slate-700">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {proposals.map((p) => {
                      const rec = recMap[p._id?.toString()];
                      const isTop = rec && rec.rank === 1;
                      const isSelected = selectedProposal?._id === p._id;

                      return (
                        <tr
                          key={p._id}
                          className={`hover:bg-slate-800 transition-colors ${
                            isTop ? "border-l-4 border-l-emerald-400" : ""
                          } ${isSelected ? "bg-slate-800/60" : ""}`}
                        >
                          <td className="px-3 py-2 border-b border-slate-800 text-slate-100">
                            {p.vendor?.name || "Unknown"}
                            <div className="text-xs text-slate-400">
                              {p.vendor?.email}
                            </div>
                          </td>
                          <td className="px-3 py-2 border-b border-slate-800 text-slate-300">
                            {p.totalPrice != null
                              ? `$${p.totalPrice}`
                              : "—"}
                          </td>
                          <td className="px-3 py-2 border-b border-slate-800 text-slate-300">
                            {p.deliveryDays != null
                              ? `${p.deliveryDays} days`
                              : "—"}
                          </td>
                          <td className="px-3 py-2 border-b border-slate-800 text-slate-300">
                            {p.paymentTerms || "—"}
                          </td>
                          <td className="px-3 py-2 border-b border-slate-800 text-slate-300">
                            {p.warranty || "—"}
                          </td>
                          <td className="px-3 py-2 border-b border-slate-800 text-slate-300">
                            {rec ? (
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
                                    Rank #{rec.rank}
                                  </span>
                                  {typeof rec.overallScore === "number" && (
                                    <span className="text-[11px] text-slate-400">
                                      Score: {rec.overallScore.toFixed(0)} / 100
                                    </span>
                                  )}
                                </div>
                                {rec.reason && (
                                  <p className="text-[11px] text-slate-400">
                                    {rec.reason}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-slate-500">
                                No AI evaluation
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2 border-b border-slate-800 text-slate-300">
                            <button
                              type="button"
                              onClick={() => setSelectedProposal(p)}
                              className={`inline-flex items-center rounded-md px-3 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-300 ${
                                isSelected
                                  ? "bg-emerald-500 text-slate-900 hover:bg-emerald-400"
                                  : "bg-slate-800 text-slate-100 hover:bg-slate-700"
                              }`}
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Details panel on the right */}
              <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
                {selectedProposal ? (
                  (() => {
                    const rec =
                      recMap[selectedProposal._id?.toString()];
                    const parsed = selectedProposal.parsedJson || {};
                    const summary =
                      selectedProposal.aiSummary ||
                      parsed.summary ||
                      "No AI summary available.";

                    return (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <h4 className="text-sm font-semibold text-slate-100">
                              {selectedProposal.vendor?.name ||
                                "Selected Proposal"}
                            </h4>
                            <p className="text-xs text-slate-400">
                              {selectedProposal.vendor?.email}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            {rec && (
                              <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
                                AI Rank #{rec.rank}
                              </span>
                            )}
                            {rec &&
                              typeof rec.overallScore === "number" && (
                                <span className="text-[11px] text-slate-400">
                                  Score: {rec.overallScore.toFixed(0)} / 100
                                </span>
                              )}
                          </div>
                        </div>

                        <div className="space-y-1 text-xs text-slate-300">
                          <div className="flex justify-between">
                            <span className="text-slate-400">
                              Total Price:
                            </span>
                            <span>
                              {selectedProposal.totalPrice != null
                                ? `$${selectedProposal.totalPrice}`
                                : parsed.totalPrice != null
                                ? `$${parsed.totalPrice}`
                                : "—"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">
                              Delivery:
                            </span>
                            <span>
                              {selectedProposal.deliveryDays != null
                                ? `${selectedProposal.deliveryDays} days`
                                : parsed.deliveryDays != null
                                ? `${parsed.deliveryDays} days`
                                : "—"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">
                              Payment Terms:
                            </span>
                            <span>
                              {selectedProposal.paymentTerms ||
                                parsed.paymentTerms ||
                                "—"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">
                              Warranty:
                            </span>
                            <span>
                              {selectedProposal.warranty ||
                                parsed.warranty ||
                                "—"}
                            </span>
                          </div>
                        </div>

                        <div>
                          <h5 className="text-xs font-semibold text-slate-200 mb-1">
                            AI Summary
                          </h5>
                          <p className="text-xs text-slate-300 whitespace-pre-line">
                            {summary}
                          </p>
                        </div>

                        {parsed.lineItems &&
                          parsed.lineItems.length > 0 && (
                            <div>
                              <h5 className="text-xs font-semibold text-slate-200 mb-1">
                                Line Items (from proposal)
                              </h5>
                              <div className="overflow-x-auto border border-slate-800 rounded-md">
                                <table className="min-w-full text-[11px]">
                                  <thead className="bg-slate-900">
                                    <tr>
                                      <th className="px-2 py-1 text-left font-semibold text-slate-300 border-b border-slate-700">
                                        Name
                                      </th>
                                      <th className="px-2 py-1 text-left font-semibold text-slate-300 border-b border-slate-700">
                                        Qty
                                      </th>
                                      <th className="px-2 py-1 text-left font-semibold text-slate-300 border-b border-slate-700">
                                        Spec
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {parsed.lineItems.map((li, idx) => (
                                      <tr
                                        key={idx}
                                        className="hover:bg-slate-900/70"
                                      >
                                        <td className="px-2 py-1 border-b border-slate-800 text-slate-100">
                                          {li.name}
                                        </td>
                                        <td className="px-2 py-1 border-b border-slate-800 text-slate-100">
                                          {li.quantity}
                                        </td>
                                        <td className="px-2 py-1 border-b border-slate-800 text-slate-300">
                                          {li.spec}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}

                        <div>
                          <h5 className="text-xs font-semibold text-slate-200 mb-1">
                            Original Email
                          </h5>
                          <div className="rounded-md border border-slate-800 bg-slate-950/80 p-2 max-h-40 overflow-y-auto">
                            <p className="text-[11px] text-slate-300 whitespace-pre-line">
                              {selectedProposal.rawEmail ||
                                "No raw email stored."}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <p className="text-xs text-slate-400">
                    Select a proposal from the table to view full details.
                  </p>
                )}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Rfp;
