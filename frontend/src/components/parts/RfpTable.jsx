const RfpTable = ({ rfps = [] }) => {
  return (
    <div className="mt-4 max-h-[70vh] overflow-y-auto border border-slate-700 bg-slate-900 rounded-md">
      <table className="min-w-full">
        <thead className="bg-slate-800 sticky top-0 z-10">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-semibold text-slate-300 border-b border-slate-700">
              S.No
            </th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-slate-300 border-b border-slate-700">
              Title
            </th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-slate-300 border-b border-slate-700">
              Budget
            </th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-slate-300 border-b border-slate-700">
              Delivery Days
            </th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-slate-300 border-b border-slate-700">
              Proposals
            </th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-slate-300 border-b border-slate-700">
              Created At
            </th>
          </tr>
        </thead>
        <tbody>
          {rfps.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="px-4 py-4 text-center text-sm text-slate-400"
              >
                No RFPs found.
              </td>
            </tr>
          ) : (
            rfps.map((rfp, index) => (
              <tr
                key={rfp._id}
                className="hover:bg-slate-800 transition-colors"
              >
                <td className="px-4 py-2 text-sm text-slate-200 border-b border-slate-800">
                  {index + 1}
                </td>
                <td className="px-4 py-2 text-sm text-slate-100 border-b border-slate-800">
                  {rfp.title}
                </td>
                <td className="px-4 py-2 text-sm text-slate-300 border-b border-slate-800">
                  {rfp.budget ?? "-"}
                </td>
                <td className="px-4 py-2 text-sm text-slate-300 border-b border-slate-800">
                  {rfp.deliveryDays ?? "-"}
                </td>
                <td className="px-4 py-2 text-sm text-slate-300 border-b border-slate-800">
                  {rfp.proposalCount ?? 0}
                </td>
                <td className="px-4 py-2 text-sm text-slate-400 border-b border-slate-800">
                  {new Date(rfp.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RfpTable;
