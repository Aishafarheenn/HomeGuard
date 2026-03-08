import React, { useState, useEffect } from 'react'
import { X, Calendar } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { createSchedule } from '../../services/requests/CreateJobticket'
import { ownerServices } from '../../services/requests/ownerServices'
import { propertyServices } from '../../services/requests/propertyServices'
import { serviceItems } from '../../services/requests/ServiceItems'

function CreateScheduleModal({ isOpen, onClose, onSuccess }) {
  const { user } = useAuth()
  const isOwner = user?.role === 'owner'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [owners, setOwners] = useState([])
  const [properties, setProperties] = useState([])
  const [packages, setPackages] = useState([])
  const [formData, setFormData] = useState({
    owner_id: '',
    property_id: '',
    package_id: '',
    scheduled_date: '',
    frequency: 'once',
    status: 'scheduled',
  })

  useEffect(() => {
    if (!isOpen) return
    const load = async () => {
      try {
        const promises = [
          propertyServices.getProperties().catch(() => []),
          serviceItems.getPackage().catch(() => []),
        ]
        if (!isOwner) promises.unshift(ownerServices.getOwners().catch(() => []))
        const results = await Promise.all(promises)
        let ownRes = []
        let propRes, pkgRes
        if (isOwner) {
          [propRes, pkgRes] = results
        } else {
          [ownRes, propRes, pkgRes] = results
        }
        setOwners(Array.isArray(ownRes) ? ownRes : [])
        setProperties(Array.isArray(propRes) ? propRes : [])
        setPackages(Array.isArray(pkgRes) ? pkgRes : [])
      } catch {
        setOwners([])
        setProperties([])
        setPackages([])
      }
    }
    load()
  }, [isOpen, isOwner])

  const handleChange = (e) => {
    setError('')
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const ownerId = isOwner ? user?.id : formData.owner_id
    if (!ownerId || !formData.property_id || !formData.package_id || !formData.scheduled_date) {
      setError(isOwner ? 'Property, package and date are required.' : 'Owner, property, package and date are required.')
      return
    }
    setLoading(true)
    try {
      await createSchedule({
        owner_id: ownerId,
        property_id: formData.property_id,
        package_id: formData.package_id,
        scheduled_date: formData.scheduled_date,
        frequency: formData.frequency,
        status: formData.status,
      })
      setFormData({
        owner_id: '',
        property_id: '',
        package_id: '',
        scheduled_date: '',
        frequency: 'once',
        status: 'scheduled',
      })
      onSuccess?.()
      onClose()
    } catch (err) {
      const detail = err.response?.data?.detail ?? err.message ?? 'Failed to create schedule'
      setError(Array.isArray(detail) ? detail.join(' ') : String(detail))
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setError('')
      setFormData({
        owner_id: '',
        property_id: '',
        package_id: '',
        scheduled_date: '',
        frequency: 'once',
        status: 'scheduled',
      })
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
              <Calendar className="w-5 h-5 text-[#7C3AED]" />
            </span>
            <h2 className="text-lg font-semibold text-[#1F2937]">Schedule inspection</h2>
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

          {!isOwner && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Owner</label>
              <select
                name="owner_id"
                value={formData.owner_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C4B5FD] focus:border-[#A78BFA]"
              >
                <option value="">Select owner</option>
                {owners.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.full_name || o.email || o.id}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Property</label>
            <select
              name="property_id"
              value={formData.property_id}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C4B5FD] focus:border-[#A78BFA]"
            >
              <option value="">Select property</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.address || p.id}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Package</label>
            <select
              name="package_id"
              value={formData.package_id}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C4B5FD] focus:border-[#A78BFA]"
            >
              <option value="">Select package</option>
              {packages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name || p.id}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Scheduled date</label>
            <input
              type="date"
              name="scheduled_date"
              value={formData.scheduled_date}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C4B5FD] focus:border-[#A78BFA]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Frequency</label>
            <select
              name="frequency"
              value={formData.frequency}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C4B5FD] focus:border-[#A78BFA]"
            >
              <option value="once">Once</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C4B5FD] focus:border-[#A78BFA]"
            >
              <option value="scheduled">Scheduled</option>
              <option value="pending">Pending</option>
            </select>
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
              {loading ? 'Creating…' : 'Create schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateScheduleModal
