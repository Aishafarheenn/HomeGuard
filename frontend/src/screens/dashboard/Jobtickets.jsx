import React, { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { RefreshCw, Ticket, MapPin, ChevronRight, Inbox, UserCheck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { createJobticketApi } from '../../services/requests/CreateJobticket'
import AssignInspectorModal from './AssignInspectorModal'

function StatusBadge({ status }) {
  const s = (status ?? '').toLowerCase()
  const styles = {
    pending: 'bg-amber-100 text-amber-800',
    assigned: 'bg-violet-100 text-violet-800',
    in_progress: 'bg-sky-100 text-sky-800',
    completed: 'bg-emerald-100 text-emerald-800',
  }
  const labels = { pending: 'Pending', assigned: 'Assigned', in_progress: 'In progress', completed: 'Completed' }
  const label = labels[s] || (status ?? '—')
  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${styles[s] || 'bg-slate-100 text-slate-700'}`}>
      {label}
    </span>
  )
}

function JobTickets() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const isInspector = user?.role === 'inspector'
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [assignTicket, setAssignTicket] = useState(null)

  const fetchTickets = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    setError(null)
    try {
      const data = await createJobticketApi.getJobtickets()
      setTickets(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
      setError('Failed to load job tickets')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {isInspector ? 'My job tickets' : 'Job tickets'}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {isInspector
              ? 'Your assigned inspections — open a job to start and complete it'
              : 'Assign pending jobs to inspectors from the list below.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchTickets(true)}
            disabled={loading || refreshing}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition shrink-0 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <span className="w-12 h-12 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center">
              <Ticket className="w-6 h-6" />
            </span>
            <div>
              <h2 className="font-semibold text-slate-900 text-lg">
                {isInspector ? 'Your assigned jobs' : 'All job tickets'}
              </h2>
              <p className="text-slate-500 text-sm mt-0.5">
                {tickets.length} {tickets.length === 1 ? 'ticket' : 'tickets'}
              </p>
            </div>
          </div>
        </div>

        {loading && (
          <div className="py-16 flex flex-col items-center justify-center text-slate-500">
            <RefreshCw className="w-10 h-10 animate-spin text-violet-500 mb-3" />
            <p className="text-sm font-medium">Loading job tickets…</p>
          </div>
        )}

        {error && !loading && (
          <div className="mx-6 mt-4 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">
            {error}
          </div>
        )}

        {!loading && !error && tickets.length === 0 && (
          <div className="py-16 flex flex-col items-center justify-center text-slate-500">
            <span className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <Inbox className="w-10 h-10 text-slate-400" />
            </span>
            <p className="font-semibold text-slate-700">No job tickets yet</p>
            <p className="text-sm mt-1 text-slate-500 max-w-sm text-center">
              {isInspector ? 'When jobs are assigned to you, they will appear here.' : 'Pending schedules will appear here once owners book inspections.'}
            </p>
          </div>
        )}

        {!loading && !error && tickets.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200 bg-slate-50">
                  <th className="py-4 px-6">Property</th>
                  {!isInspector && <th className="py-4 px-6">Owner</th>}
                  {!isInspector && <th className="py-4 px-6">Inspector</th>}
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Assigned</th>
                  <th className="py-4 px-6 w-36 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.map((row) => (
                  <tr key={row.id} className="hover:bg-violet-50/30 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <span className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-violet-100 group-hover:text-violet-600 transition-colors shrink-0">
                          <MapPin className="w-4 h-4" />
                        </span>
                        <span className="font-medium text-slate-900">
                          {row.schedule?.property?.address || '—'}
                        </span>
                      </div>
                    </td>
                    {!isInspector && (
                      <>
                        <td className="py-4 px-6 text-slate-600">
                          {row.schedule?.owner?.full_name || '—'}
                        </td>
                        <td className="py-4 px-6 text-slate-600">{row.inspector?.full_name || '—'}</td>
                      </>
                    )}
                    <td className="py-4 px-6">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="py-4 px-6 text-slate-500 text-sm">
                      {row.assigned_at ? new Date(row.assigned_at).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '—'}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        {isAdmin &&
                          (row.status ?? '').toLowerCase() === 'pending' &&
                          !row.inspector_id &&
                          row.schedule?.id && (
                            <button
                              type="button"
                              onClick={() => setAssignTicket(row)}
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-violet-200 text-violet-700 text-sm font-medium hover:bg-violet-50 transition"
                            >
                              <UserCheck className="w-4 h-4" />
                              Assign
                            </button>
                          )}
                        <Link
                          to={`/dashboard/jobtickets/${row.id}`}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition"
                        >
                          View job
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AssignInspectorModal
        ticket={assignTicket}
        isOpen={!!assignTicket}
        onClose={() => setAssignTicket(null)}
        onSuccess={fetchTickets}
      />
    </div>
  )
}

export default JobTickets
