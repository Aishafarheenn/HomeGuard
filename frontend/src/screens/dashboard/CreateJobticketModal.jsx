import React, { useState, useEffect } from 'react'
import { X, ClipboardList } from 'lucide-react'
import { createJobticketApi, getSchedules } from '../../services/requests/CreateJobticket'
import { inspectorServices } from '../../services/requests/inspectorServices'

function CreateJobticketModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [schedules, setSchedules] = useState([])
  const [inspectors, setInspectors] = useState([])
  const [formData, setFormData] = useState({
    schedule_id: '',
    inspector_id: '',
    status: 'assigned',
  })

  useEffect(() => {
    if (!isOpen) return
    const load = async () => {
      try {
        const [schedRes, inspRes] = await Promise.all([
          getSchedules().catch(() => []),
          inspectorServices.getInspectors().catch(() => []),
        ])
        setSchedules(Array.isArray(schedRes) ? schedRes : [])
        setInspectors(Array.isArray(inspRes) ? inspRes : [])
      } catch {
        setSchedules([])
        setInspectors([])
      }
    }
    load()
  }, [isOpen])

  const handleChange = (e) => {
    setError('')
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!formData.schedule_id || !formData.inspector_id) {
      setError('Schedule and inspector are required.')
      return
    }
    setLoading(true)
    try {
      await createJobticketApi.createJobticket({
        schedule_id: formData.schedule_id,
        inspector_id: formData.inspector_id,
        status: formData.status,
      })
      setFormData({ schedule_id: '', inspector_id: '', status: 'assigned' })
      onSuccess?.()
      onClose()
    } catch (err) {
      const detail = err.response?.data?.detail ?? err.message ?? 'Failed to create job ticket'
      setError(Array.isArray(detail) ? detail.join(' ') : String(detail))
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setError('')
      setFormData({ schedule_id: '', inspector_id: '', status: 'assigned' })
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
              <ClipboardList className="w-5 h-5 text-[#7C3AED]" />
            </span>
            <h2 className="text-lg font-semibold text-[#1F2937]">Create job ticket</h2>
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
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Schedule</label>
            <select
              name="schedule_id"
              value={formData.schedule_id}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C4B5FD] focus:border-[#A78BFA]"
            >
              <option value="">Select schedule</option>
              {schedules.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.scheduled_date ? `${String(s.scheduled_date)}` : s.id}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Inspector</label>
            <select
              name="inspector_id"
              value={formData.inspector_id}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C4B5FD] focus:border-[#A78BFA]"
            >
              <option value="">Select inspector</option>
              {inspectors.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.full_name || i.email || i.id}
                </option>
              ))}
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
              <option value="assigned">Assigned</option>
              <option value="in_progress">In progress</option>
              <option value="completed">Completed</option>
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
              {loading ? 'Creating…' : 'Create ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateJobticketModal
