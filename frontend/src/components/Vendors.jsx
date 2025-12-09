import React, { useEffect, useState } from "react";
import VendorTable from "./parts/VendorTable";
import AddVendorForm from "./parts/AddVendorForm";
import toast from "react-hot-toast";

const VendorsPage = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // ---------- Fetch vendors ----------
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch("http://localhost:4000/api/list/vendor");
        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.message || "Failed to fetch vendors");
        }

        setVendors(json.data || []);
      } catch (err) {
        console.error("Error fetching vendors:", err);
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, []);

  // ---------- After vendor created from form ----------
  const handleVendorCreated = (newVendor) => {
    setVendors((prev) => [...prev, newVendor]);
    setShowAddForm(false);
  };

  // ---------- Delete vendor (optional) ----------
  const handleDeleteVendor = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this vendor?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`http://localhost:4000/api/vendor/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to delete vendor");
      }

      setVendors((prev) => prev.filter((v) => v._id !== id));
      toast.success("Vendor deleted successfully"); 
    } catch (err) {
      console.error("Error deleting vendor:", err);
      alert(err.message || "Failed to delete vendor");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header with Add Vendor button */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
        <h1 className="text-xl font-semibold">Vendor Details</h1>

        <button
          onClick={() => setShowAddForm((prev) => !prev)}
          className="inline-flex items-center rounded-md bg-emerald-500 px-3 py-1.5 text-sm font-medium text-slate-900 hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300"
        >
          + Add Vendor
        </button>
      </header>

      {/* Add vendor form (separate component) */}
      {showAddForm && (
        <AddVendorForm
          onCreated={handleVendorCreated}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      <div className="px-6 py-4">
        {loading && (
          <main className="flex-1 flex items-center mt-20 justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-10 w-10 rounded-full border-2 border-slate-700 border-t-sky-400 animate-spin" />
              <p className="text-sm text-slate-300">Loading Vendor Details...</p>
            </div>
          </main>
        )}

        {error && (
          <p className="mt-2 text-sm text-red-400">{error}</p>
        )}

        {!loading && !error && (
          <VendorTable vendors={vendors} onDelete={handleDeleteVendor} />
        )}
      </div>
    </div>
  );
};

export default VendorsPage;
