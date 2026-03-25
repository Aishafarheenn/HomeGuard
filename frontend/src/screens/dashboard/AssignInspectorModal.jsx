import React, { useState, useEffect } from 'react'
import { X, UserCheck } from 'lucide-react'
import { createJobticketApi } from '../../services/requests/CreateJobticket'
import { inspectorServices } from '../../services/requests/inspectorServices'

function AssignInspectorModal({ ticket, isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [inspectors, setInspectors] = useState([])
  const [inspectorId, setInspectorId] = useState('')

  const scheduleId = ticket?.schedule?.id
  const address = ticket?.schedule?.property?.address ?? '—'

  useEffect(() => {
    if (!isOpen) return
    setInspectorId('')
    setError('')
    const load = async () => {
      try {
        const res = await inspectorServices.getInspectors().catch(() => [])
        const list = Array.isArray(res) ? res : []
        setInspectors(list.filter((i) => (i.status ?? '').toLowerCase() === 'approved'))
      } catch {
        setInspectors([])
      }
    }
    load()
  }, [isOpen, ticket?.id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!scheduleId) {
      setError('This ticket has no linked schedule.')
      return
    }
    if (!inspectorId) {
      setError('Choose an inspector.')
      return
    }
    setLoading(true)
    try {
      await createJobticketApi.createJobticket({
        schedule_id: scheduleId,
        inspector_id: inspectorId,
        status: 'assigned',
      })
      onSuccess?.()
      onClose()
    } catch (err) {
      const detail = err.response?.data?.detail ?? err.message ?? 'Failed to assign inspector'
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

  if (!isOpen || !ticket) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50" onClick={handleClose} aria-hidden />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </span>
            <div>
              <h2 className="font-semibold text-slate-900">Assign inspector</h2>
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{address}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">{error}</div>
          )}

          <div>
            <label htmlFor="assign-inspector" className="block text-sm font-medium text-slate-700 mb-1.5">
              Inspector
            </label>
            <select
              id="assign-inspector"
              value={inspectorId}
              onChange={(e) => {
                setError('')
                setInspectorId(e.target.value)
              }}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
              required
            >
              <option value="">Select an inspector</option>
              {inspectors.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.full_name}
                  {i.email ? ` (${i.email})` : ''}
                </option>
              ))}
            </select>
            {inspectors.length === 0 && (
              <p className="text-xs text-amber-600 mt-2">No approved inspectors yet. Approve inspectors in the Inspectors section first.</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !scheduleId || inspectors.length === 0}
              className="flex-1 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-50"
            >
              {loading ? 'Assigning…' : 'Assign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AssignInspectorModal
