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
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937]">Inspectors</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {isAdmin
              ? 'Approve or reject inspector applications. Only approved inspectors can sign in.'
              : 'List of inspectors'}
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-[#1F2937]">Inspector list</h2>
          <p className="text-slate-500 text-sm mt-0.5">All registered inspectors and their approval status</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#7C3AED]" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-100 bg-slate-50/50">
                  <th className="py-3 px-6 font-medium">Name</th>
                  <th className="py-3 px-6 font-medium">Email</th>
                  <th className="py-3 px-6 font-medium">Phone</th>
                  <th className="py-3 px-6 font-medium">Status</th>
                  {isAdmin && <th className="py-3 px-6 font-medium">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {inspectors.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 5 : 4} className="py-8 px-6 text-center text-slate-500">
                      No inspectors yet. Inspectors register from the landing page, then appear here for approval.
                    </td>
                  </tr>
                ) : (
                  inspectors.map((row) => (
                    <tr key={row.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                      <td className="py-3 px-6 font-medium text-[#1F2937]">{row.full_name}</td>
                      <td className="py-3 px-6 text-slate-600">{row.email}</td>
                      <td className="py-3 px-6 text-slate-600">{row.phone || '—'}</td>
                      <td className="py-3 px-6">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            row.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-700'
                              : row.status === 'rejected'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="py-3 px-6">
                          {row.status === 'pending' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApprove(row.id)}
                                disabled={!!actingId}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 disabled:opacity-50"
                              >
                                {actingId === row.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <CheckCircle className="w-3.5 h-3.5" />
                                )}
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(row.id)}
                                disabled={!!actingId}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-xs font-medium hover:bg-red-200 disabled:opacity-50"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Inspector
