import React, { useState } from "react";
import toast from "react-hot-toast";

const AddVendorForm = ({ onCreated, onCancel }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setSubmitting(true);
  setError("");

  try {
    const res = await fetch("http://localhost:4000/api/create/vendor", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        phonenumber: form.phone, 
      }),
    });

    const json = await res.json();

    if (!res.ok || !json.success) {
      throw new Error(json.message || "Failed to create vendor");
    }

    if (onCreated) {
      onCreated({
        name: form.name,
        email: form.email,
        phone: form.phone,
      });
    }
    
    toast.success("Vendor Created Successfully");
    setForm({ name: "", email: "", phone: "" });
  } catch (err) {
    console.error("Error creating vendor:", err);
    setError(err.message || "Failed to create vendor");
  } finally {
    setSubmitting(false);
  }
};


  return (
    <div className="border-b border-slate-800 bg-slate-900 px-6 py-4">
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1fr_1fr_auto]"
      >
        {/* Name */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Name
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Enter vendor name"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Enter vendor email"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Enter phone number"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-end gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-emerald-300"
          >
            {submitting ? "Saving..." : "Save"}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center justify-center rounded-md border border-slate-600 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {error && (
        <p className="mt-2 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};

export default AddVendorForm;
