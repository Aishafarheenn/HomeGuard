import React, { useState, useEffect } from 'react'
import { X, ClipboardCheck } from 'lucide-react'
import { inspectionServices } from '../../services/requests/inspectionServices'
import { createJobticketApi } from '../../services/requests/CreateJobticket'

function toDateTimeLocal(d) {
  const date = d instanceof Date ? d : new Date(d)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day}T${h}:${min}`
}

function CreateInspectionModal({ isOpen, onClose, onSuccess, prefilledJobTicketId = null, startJobMode = false }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [jobTickets, setJobTickets] = useState([])
  const [formData, setFormData] = useState({
    job_ticket_id: prefilledJobTicketId ?? '',
    start_time: '',
    end_time: '',
    overall_status: 'scheduled',
  })

  useEffect(() => {
    if (isOpen) {
      const now = toDateTimeLocal(new Date())
      setFormData((prev) => ({
        ...prev,
        job_ticket_id: prefilledJobTicketId ?? prev.job_ticket_id,
        ...(startJobMode
          ? { start_time: now, end_time: now, overall_status: 'in_progress' }
          : {}),
      }))
    }
  }, [isOpen, prefilledJobTicketId, startJobMode])

  useEffect(() => {
    if (!isOpen) return
    createJobticketApi
      .getJobtickets()
      .then((data) => setJobTickets(Array.isArray(data) ? data : []))
      .catch(() => setJobTickets([]))
  }, [isOpen])

  const handleChange = (e) => {
    setError('')
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const toISO = (dateTimeLocal) => {
    if (!dateTimeLocal) return null
    return new Date(dateTimeLocal).toISOString()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!formData.job_ticket_id) {
      setError('Job ticket is required.')
      return
    }
    const startTime = formData.start_time ? toISO(formData.start_time) : null
    const endTime = formData.end_time ? toISO(formData.end_time) : startTime
    if (!startTime && !formData.start_time) {
      setError('Start time is required.')
      return
    }
    setLoading(true)
    try {
      await inspectionServices.createInspection({
        job_ticket_id: formData.job_ticket_id,
        start_time: startTime ?? toISO(formData.start_time),
        end_time: endTime ?? toISO(formData.end_time),
        overall_status: formData.overall_status,
      })
      setFormData({ job_ticket_id: '', start_time: '', end_time: '', overall_status: 'scheduled' })
      onSuccess?.()
      onClose()
    } catch (err) {
      const detail = err.response?.data?.detail ?? err.message ?? 'Failed to create inspection'
      setError(Array.isArray(detail) ? detail.join(' ') : String(detail))
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setError('')
      setFormData({ job_ticket_id: prefilledJobTicketId ?? '', start_time: '', end_time: '', overall_status: 'scheduled' })
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
              <ClipboardCheck className="w-5 h-5 text-[#7C3AED]" />
            </span>
            <h2 className="text-lg font-semibold text-[#1F2937]">Create inspection</h2>
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
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Job ticket</label>
            <select
              name="job_ticket_id"
              value={formData.job_ticket_id}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C4B5FD] focus:border-[#A78BFA]"
            >
              <option value="">Select job ticket</option>
              {jobTickets.map((jt) => (
                <option key={jt.id} value={jt.id}>
                  {jt.schedule?.property?.address ?? jt.id} — {jt.inspector?.full_name ?? 'Unassigned'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Start time</label>
            <input
              type="datetime-local"
              name="start_time"
              value={formData.start_time}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C4B5FD] focus:border-[#A78BFA]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">End time</label>
            <input
              type="datetime-local"
              name="end_time"
              value={formData.end_time}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C4B5FD] focus:border-[#A78BFA]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
            <select
              name="overall_status"
              value={formData.overall_status}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C4B5FD] focus:border-[#A78BFA]"
            >
              <option value="scheduled">Scheduled</option>
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
              {loading ? 'Creating…' : 'Create inspection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateInspectionModal
