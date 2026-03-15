import React, { useState, useEffect } from 'react'
import { X, MapPin } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { propertyServices } from '../../services/requests/propertyServices'
import { ownerServices } from '../../services/requests/ownerServices'
import LocationPickerMap from '../../components/LocationPickerMap'

function EditPropertyModal({ isOpen, onClose, onSuccess, propertyId }) {
  const { user } = useAuth()
  const isOwner = user?.role === 'owner'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [owners, setOwners] = useState([])
  const [formData, setFormData] = useState({
    address: '',
    latitude: '',
    longitude: '',
    owner_id: '',
  })

  useEffect(() => {
    if (isOpen && propertyId) {
      if (!isOwner) ownerServices.getOwners().then((data) => setOwners(Array.isArray(data) ? data : [])).catch(() => setOwners([]))
      propertyServices.getPropertyById(propertyId).then((p) => {
        setFormData({
          address: p.address ?? '',
          latitude: p.latitude != null ? String(p.latitude) : '',
          longitude: p.longitude != null ? String(p.longitude) : '',
          owner_id: p.owner_id ?? '',
        })
      }).catch(() => setError('Failed to load property'))
    }
  }, [isOpen, propertyId])

  const handleChange = (e) => {
    setError('')
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleMapLocationSelect = (lat, lng) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat != null ? String(Number(lat).toFixed(6)) : '',
      longitude: lng != null ? String(Number(lng).toFixed(6)) : '',
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!formData.address.trim()) {
      setError('Address is required.')
      return
    }
    if (!isOwner && !formData.owner_id) {
      setError('Please select an owner.')
      return
    }
    setLoading(true)
    try {
      const payload = {
        address: formData.address.trim(),
        latitude: formData.latitude || null,
        longitude: formData.longitude || null,
      }
      if (!isOwner) payload.owner_id = formData.owner_id
      await propertyServices.updateProperty(propertyId, payload)
      onSuccess?.()
      onClose()
    } catch (err) {
      const detail = err.response?.data?.detail ?? err.message ?? 'Failed to update property'
      setError(Array.isArray(detail) ? detail.join(' ') : String(detail))
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setError('')
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4" aria-modal="true">
      <div className="absolute inset-0 bg-slate-900/50" onClick={handleClose} aria-hidden />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-violet-600" />
            </span>
            <h2 className="text-lg font-semibold text-slate-900">Edit property</h2>
          </div>
          <button type="button" onClick={handleClose} disabled={loading} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-100 text-red-700 px-4 py-3 text-sm">{error}</div>
          )}

          {!isOwner && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Owner</label>
              <select
                name="owner_id"
                value={formData.owner_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400"
              >
                <option value="">Select owner</option>
                {owners.map((o) => (
                  <option key={o.id} value={o.id}>{o.full_name} ({o.email})</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Address</label>
            <input
              type="text"
              name="address"
              placeholder="Enter property address"
              value={formData.address}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Property location</label>
            <p className="text-xs text-slate-500 mb-2">Click on the map to set or update the location. Drag the marker to adjust.</p>
            <LocationPickerMap
              latitude={formData.latitude || undefined}
              longitude={formData.longitude || undefined}
              onLocationSelect={handleMapLocationSelect}
              height={220}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Latitude</label>
              <input
                type="number"
                step="any"
                name="latitude"
                placeholder="e.g. 11.2588"
                value={formData.latitude}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Longitude</label>
              <input
                type="number"
                step="any"
                name="longitude"
                placeholder="e.g. 75.7804"
                value={formData.longitude}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 text-sm"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={handleClose} disabled={loading} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-3 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditPropertyModal
