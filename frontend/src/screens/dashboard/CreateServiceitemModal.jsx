import React, { useState } from 'react'
import { X, Package } from 'lucide-react'
import { serviceItems } from '../../services/requests/ServiceItems'

function CreateServiceitemModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
  })

  const handleChange = (e) => {
    setError('')
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!formData.name.trim()) {
      setError('Name is required.')
      return
    }
    setLoading(true)
    try {
      await serviceItems.createPackage({
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: formData.price,
      })
      setFormData({ name: '', description: '', price: '' })
      onSuccess?.()
      onClose()
    } catch (err) {
      const detail = err.response?.data?.detail ?? err.message ?? 'Failed to create package'
      setError(Array.isArray(detail) ? detail.join(' ') : String(detail))
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setError('')
      setFormData({ name: '', description: '', price: '' })
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50" onClick={handleClose} aria-hidden />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-10 h-10 rounded-xl bg-[#EDE9FE] flex items-center justify-center">
              <Package className="w-5 h-5 text-[#7C3AED]" />
            </span>
            <h2 className="text-lg font-semibold text-[#1F2937]">Create package</h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Name</label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g. Basic inspection"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C4B5FD] focus:border-[#A78BFA]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <textarea
              name="description"
              rows={3}
              placeholder="What this package includes..."
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C4B5FD] focus:border-[#A78BFA] resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Price</label>
            <input
              type="number"
              name="price"
              min={0}
              step={1}
              placeholder="0"
              value={formData.price}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C4B5FD] focus:border-[#A78BFA]"
            />
          </div>

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
              {loading ? 'Creating…' : 'Create package'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateServiceitemModal
