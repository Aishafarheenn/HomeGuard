import React, { useState } from "react";
import { X, MapPin } from "lucide-react";
import { propertyServices } from "../../services/requests/propertyServices";

function CreatePropertyModal({ isOpen, onClose }) {

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    address: "",
    latitude: "",
    longitude: "",
  });


  const handleChange = (e) => {
    setError('')
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("")
    if (!formData.address.trim()) {
      setError('Address not required')
      return
    }
    setLoading(true)
    try {
      await propertyServices.createProperty({
        address: formData.address.trim(),
        latitude: formData.latitude.trim(),
        longitude: formData.longitude.trim(),
      })
      setFormData({ address: '', longitude: '', latitude: '' })

    } catch (err) {
      const detail = err.response?.data?.detail ?? err.message ?? 'Failed to Add Property'
      setError(Array.isArray(detail) ? detail.join('') : String(detail))
    } finally {
      setLoading(false)
      onClose()
    }

  }

  const handleClose = () => {
    if (!loading) {
      setError('')
      setFormData({ address: '', latitude: '', longitude: '' })
    }
    onClose()
  }
  if (!isOpen) return null


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
              <MapPin className="w-5 h-5 text-[#7C3AED]" />
            </span>
            <h2 className="text-lg font-semibold text-[#1F2937]">
              Create Property
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

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Address
            </label>
            <input
              type="text"
              name="address"
              placeholder="Enter property address"
              value={formData.address}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C4B5FD] focus:border-[#A78BFA]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Latitude
            </label>
            <input
              type="number"
              step="any"
              name="latitude"
              placeholder="e.g. 11.2588"
              value={formData.latitude}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C4B5FD] focus:border-[#A78BFA]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Longitude
            </label>
            <input
              type="number"
              step="any"
              name="longitude"
              placeholder="e.g. 75.7804"
              value={formData.longitude}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C4B5FD] focus:border-[#A78BFA]"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-[#A78BFA] text-white font-semibold hover:bg-[#9333EA] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating…" : "Create Property"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreatePropertyModal;
