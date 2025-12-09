import React from "react";

const VendorTable = ({ vendors = [], onDelete }) => {
  return (
    <div className="overflow-x-auto rounded-md border border-slate-700 bg-slate-900">
      <table className="min-w-full">
        <thead className="bg-slate-800 sticky top-0 z-10">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-semibold text-slate-300 border-b border-slate-700">
              S.No
            </th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-slate-300 border-b border-slate-700">
              Name
            </th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-slate-300 border-b border-slate-700">
              Email
            </th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-slate-300 border-b border-slate-700">
              Phone
            </th>
            <th className="px-4 py-2 text-center text-xs font-semibold text-slate-300 border-b border-slate-700">
              Action
            </th>
          </tr>
        </thead>

        <tbody>
          {vendors.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="px-4 py-4 text-center text-sm text-slate-400"
              >
                No vendors found.
              </td>
            </tr>
          ) : (
            vendors.map((vendor, index) => (
              <tr
                key={vendor._id}
                className="hover:bg-slate-800 transition-colors"
              >
                <td className="px-4 py-2 text-sm text-slate-200 border-b border-slate-800">
                  {index + 1}
                </td>
                <td className="px-4 py-2 text-sm text-slate-100 border-b border-slate-800">
                  {vendor.name}
                </td>
                <td className="px-4 py-2 text-sm text-slate-300 border-b border-slate-800">
                  {vendor.email}
                </td>
                <td className="px-4 py-2 text-sm text-slate-300 border-b border-slate-800">
                  {vendor.phone || "-"}
                </td>
                <td className="px-4 py-2 text-center border-b border-slate-800">
                  <button
                    onClick={() => onDelete && onDelete(vendor._id)}
                    className="inline-flex items-center rounded-md bg-red-500 px-3 py-1 text-xs font-medium text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default VendorTable;
