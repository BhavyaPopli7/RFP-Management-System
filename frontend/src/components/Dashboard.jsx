import React, { useState, useEffect } from "react";
import AddRfpModal from "./parts/AddRfpModel";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Dashboard = () => {
  const [showAddRfp, setShowAddRfp] = useState(false);
  const [rfps, setRfps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  // ---- Fetch RFPs on mount ----
  useEffect(() => {
    const fetchRfps = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch("http://localhost:4000/api/rfp/list");
        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.message || "Failed to fetch RFPs");
        }

        setRfps(json.data || []);
      } catch (err) {
        console.error("Error fetching RFPs:", err);
        setError(err.message || "Something went wrong while fetching RFPs");
      } finally {
        setLoading(false);
      }
    };

    fetchRfps();
  }, [showAddRfp]);

  // ---- Delete RFP handler ----
  const handleDeleteRfp = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this RFP?");
    if (!confirmDelete) return;

    try {
      // adjust URL if your delete route is different
      const res = await fetch(`http://localhost:4000/api/rfp/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        toast.error("Failed to delete RFP");
        throw new Error(json.message || "Failed to delete RFP");
      }

      setRfps((prev) => prev.filter((rfp) => rfp._id !== id));
      toast.success("Rfp deleted successfully");
    } catch (err) {
      console.error("Error deleting RFP:", err);
      toast.error("Failed to delete RFP");
    }
  };

  const handleViewRfp = (rfp) => {
    navigate(`/rfp/${rfp._id}`);
  };

  return (
    <div>
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
        <h1 className="text-xl font-semibold">Dashboard</h1>

        <button
          onClick={() => setShowAddRfp(true)}
          className="inline-flex items-center rounded-md bg-emerald-500 px-3 py-1.5 text-sm font-medium text-slate-900 hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300"
        >
          + Add RFP
        </button>
      </header>

      {/* Main content */}
      <main className="p-6 text-slate-100">
        <h2 className="text-lg font-semibold mb-4">RFPs</h2>

        {loading && (
          <main className="flex-1 flex items-center mt-20 justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-10 w-10 rounded-full border-2 border-slate-700 border-t-sky-400 animate-spin" />
              <p className="text-sm text-slate-300">Loading Rfps...</p>
            </div>
          </main>
        )}

        {error && (
          <p className="text-sm text-red-400 mb-2">{error}</p>
        )}

        {!loading && !error && (
          <div className="mt-2 max-h-[70vh] overflow-y-auto border border-slate-700 bg-slate-900 rounded-md">
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
                    Created At
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-slate-300 border-b border-slate-700">
                    No. of Proposals
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-semibold text-slate-300 border-b border-slate-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {rfps.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
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
                        {new Date(rfp.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 text-sm text-slate-300 border-b border-slate-800">
                        {rfp.proposalCount ?? 0}
                      </td>
                      <td className="px-4 py-2 text-center border-b border-slate-800">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewRfp(rfp)}
                            className="inline-flex items-center rounded-md bg-slate-700 px-3 py-1 text-xs font-medium text-slate-100 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDeleteRfp(rfp._id)}
                            className="inline-flex items-center rounded-md bg-red-500 px-3 py-1 text-xs font-medium text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Centered Add RFP popup */}
      {showAddRfp && (
        <AddRfpModal onClose={() => setShowAddRfp(false)} />
      )}
    </div>
  );
};

export default Dashboard;
