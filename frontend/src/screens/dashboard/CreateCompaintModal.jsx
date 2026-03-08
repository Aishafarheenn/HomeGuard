import React, { useState } from "react";
import { X, MessageSquare } from "lucide-react";
import { newComplaint } from "../../services/requests/newComplaint";


function CreateComplaintModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    message: "",
  });

  const handleChange = (e) => {
    setError("");
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.message.trim()) {
      setError("Message is required");
      return;
    }

    setLoading(true);
    try {
      await newComplaint.createComplaint({
        message: formData.message.trim(),
      });

      setFormData({ message: "" });
      onSuccess?.();
      onClose();
    } catch (err) {
      const detail =
        err.response?.data?.detail ??
        err.message ??
        "Failed to submit complaint";
      setError(Array.isArray(detail) ? detail.join("") : String(detail));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError("");
      setFormData({ message: "" });
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-slate-900/50"
        onClick={handleClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-10 h-10 rounded-xl bg-[#EDE9FE] flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-[#7C3AED]" />
            </span>
            <h2 className="text-lg font-semibold text-[#1F2937]">
              Create Complaint
            </h2>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <p className="text-sm text-slate-500">
            Complaint will be submitted with your logged-in account (name and email are added automatically).
          </p>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Message
            </label>
            <textarea
              name="message"
              rows="4"
              placeholder="Write your complaint..."
              value={formData.message}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#C4B5FD]"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-[#A78BFA] text-white font-semibold hover:bg-[#9333EA]"
            >
              {loading ? "Submitting…" : "Submit Complaint"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateComplaintModal;