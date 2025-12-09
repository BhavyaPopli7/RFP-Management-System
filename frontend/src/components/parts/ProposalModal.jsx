
const ProposalsModal = ({ rfp, proposals = [], onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-4xl rounded-xl bg-slate-900 border border-slate-700 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">
              Proposals for: {rfp?.title}
            </h2>
            <p className="text-xs text-slate-400">
              RFP ID: {rfp?._id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-sm"
          >
            ✕
          </button>
        </div>

        {/* Table */}
        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
          {proposals.length === 0 ? (
            <p className="text-sm text-slate-300">
              No proposals submitted yet for this RFP.
            </p>
          ) : (
            <table className="min-w-full border border-slate-700 bg-slate-900">
              <thead className="bg-slate-800">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-300 border-b border-slate-700">
                    Vendor
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-300 border-b border-slate-700">
                    Total Price
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-300 border-b border-slate-700">
                    Delivery Days
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-300 border-b border-slate-700">
                    Payment Terms
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-300 border-b border-slate-700">
                    Warranty
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-300 border-b border-slate-700">
                    Score
                  </th>
                </tr>
              </thead>
              <tbody>
                {proposals.map((p) => (
                  <tr
                    key={p._id}
                    className="hover:bg-slate-800 transition-colors"
                  >
                    <td className="px-3 py-2 text-sm text-slate-100 border-b border-slate-800">
                      {p.vendor?.name}
                      <div className="text-xs text-slate-400">
                        {p.vendor?.email}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-sm text-slate-300 border-b border-slate-800">
                      {p.totalPrice ?? "-"}
                    </td>
                    <td className="px-3 py-2 text-sm text-slate-300 border-b border-slate-800">
                      {p.deliveryDays ?? "-"}
                    </td>
                    <td className="px-3 py-2 text-sm text-slate-300 border-b border-slate-800">
                      {p.paymentTerms || "-"}
                    </td>
                    <td className="px-3 py-2 text-sm text-slate-300 border-b border-slate-800">
                      {p.warranty || "-"}
                    </td>
                    <td className="px-3 py-2 text-sm text-slate-300 border-b border-slate-800">
                      {p.scoreOverall ?? "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProposalsModal;
