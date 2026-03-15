import React, { useState, useEffect } from 'react'
import { UserCog, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { inspectorServices } from '../../services/requests/inspectorServices'

function Inspector() {
  const { user } = useAuth()
  const [inspectors, setInspectors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actingId, setActingId] = useState(null)

  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    let cancelled = false
    async function fetchList() {
      setLoading(true)
      setError('')
      try {
        const data = await inspectorServices.getInspectors()
        if (!cancelled) setInspectors(Array.isArray(data) ? data : [])
      } catch (err) {
        if (!cancelled) {
          const detail = err.response?.data?.detail ?? err.message ?? 'Failed to load inspectors'
          setError(Array.isArray(detail) ? detail.join(' ') : String(detail))
          setInspectors([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchList()
    return () => { cancelled = true }
  }, [])

  const handleApprove = async (inspectorId) => {
    setActingId(inspectorId)
    try {
      const updated = await inspectorServices.approveInspector(inspectorId)
      setInspectors((prev) =>
        prev.map((i) => (i.id === updated.id ? { ...i, status: updated.status, approved_by: updated.approved_by } : i))
      )
    } catch (err) {
      const detail = err.response?.data?.detail ?? err.message ?? 'Approve failed'
      setError(Array.isArray(detail) ? detail.join(' ') : String(detail))
    } finally {
      setActingId(null)
    }
  }

  const handleReject = async (inspectorId) => {
    setActingId(inspectorId)
    try {
      const updated = await inspectorServices.rejectInspector(inspectorId)
      setInspectors((prev) =>
        prev.map((i) => (i.id === updated.id ? { ...i, status: updated.status, approved_by: updated.approved_by } : i))
      )
    } catch (err) {
      const detail = err.response?.data?.detail ?? err.message ?? 'Reject failed'
      setError(Array.isArray(detail) ? detail.join(' ') : String(detail))
    } finally {
      setActingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Inspectors</h1>
          <p className="text-slate-500 text-sm mt-1">
            {isAdmin
              ? 'Approve or reject inspector applications. Only approved inspectors can sign in.'
              : 'List of inspectors'}
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-100 text-red-700 px-4 py-3 text-sm">{error}</div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <span className="w-12 h-12 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center">
              <UserCog className="w-6 h-6" />
            </span>
            <div>
              <h2 className="font-semibold text-slate-900 text-lg">Inspector list</h2>
              <p className="text-slate-500 text-sm mt-0.5">All registered inspectors and their approval status</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-500">
            <Loader2 className="w-10 h-10 animate-spin text-violet-500 mb-3" />
            <p className="text-sm font-medium">Loading inspectors…</p>
          </div>
        ) : inspectors.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-500">
            <span className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <UserCog className="w-10 h-10 text-slate-400" />
            </span>
            <p className="font-semibold text-slate-700">No inspectors yet</p>
            <p className="text-sm mt-1 text-slate-500 max-w-sm text-center">
              Inspectors register from the landing page, then appear here for approval.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200 bg-slate-50">
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Email</th>
                  <th className="py-4 px-6">Phone</th>
                  <th className="py-4 px-6">Status</th>
                  {isAdmin && <th className="py-4 px-6 w-44 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inspectors.map((row) => (
                  <tr key={row.id} className="hover:bg-violet-50/30 transition-colors">
                    <td className="py-4 px-6 font-medium text-slate-900">{row.full_name}</td>
                    <td className="py-4 px-6 text-slate-600 text-sm">{row.email}</td>
                    <td className="py-4 px-6 text-slate-600">{row.phone || '—'}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold capitalize ${
                          row.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : row.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="py-4 px-6 text-right">
                        {row.status === 'pending' && (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleApprove(row.id)}
                              disabled={!!actingId}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition"
                            >
                              {actingId === row.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(row.id)}
                              disabled={!!actingId}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm font-medium hover:bg-red-100 disabled:opacity-50 transition"
                            >
                              <XCircle className="w-4 h-4" />
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Inspector
