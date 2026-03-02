import React, { useState } from "react";
import { X, Star } from "lucide-react";
import { feedbackService } from "../../services/requests/feedbackService";

function CreateFeedbackModal({ isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rating: "",
    comment: "",
  });

  const handleChange = (e) => {
    setError("");
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.rating ||
      !formData.comment.trim()
    ) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    try {
      await feedbackService.CreateFeedback({
        name: formData.name.trim(),
        email: formData.email.trim(),
        rating: Number(formData.rating),
        comment: formData.comment.trim(),
      });

      setFormData({ name: "", email: "", rating: "", comment: "",});
    } catch (err) {
      const detail =
        err.response?.data?.detail ??
        err.message ??
        "Failed to submit feedback";
      setError(Array.isArray(detail) ? detail.join("") : String(detail));
    } finally {
      setLoading(false);
      onClose();
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError("");
      setFormData({ name: "", email: "", rating: "", comment: "", });
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/50"
        onClick={handleClose}
      />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-10 h-10 rounded-xl bg-[#EDE9FE] flex items-center justify-center">
              <Star className="w-5 h-5 text-[#7C3AED]" />
            </span>
            <h2 className="text-lg font-semibold text-[#1F2937]">
              Create Feedback
            </h2>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="p-2 rounded-lg text-slate-400 hover:bg-slate-100"
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

          {/* Name */}
          <input
            type="text"
            name="name"
            placeholder="Enter your name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#C4B5FD]"
          />

          {/* Email */}
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#C4B5FD]"
          />

          {/* Rating */}
          <select
            name="rating"
            value={formData.rating}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#C4B5FD]"
          >
            <option value="">Select Rating</option>
            <option value="1">1 - Very Bad</option>
            <option value="2">2 - Bad</option>
            <option value="3">3 - Average</option>
            <option value="4">4 - Good</option>
            <option value="5">5 - Excellent</option>
          </select>

          {/* Comment */}
          <textarea
            name="comment"
            rows="4"
            placeholder="Write your feedback..."
            value={formData.comment}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#C4B5FD]"
          />

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-[#A78BFA] text-white font-semibold"
            >
              {loading ? "Submitting…" : "Submit Feedback"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateFeedbackModal;