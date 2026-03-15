import React, { useEffect, useState, useCallback } from 'react'
import { ClipboardList, Loader2, User, Package, MapPin, RefreshCw, Eye, X, CheckCircle, UserPlus, Calendar, FileText, Image, Video, AlertTriangle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { inspectionServices } from '../../services/requests/inspectionServices'
import { endpoint } from '../../services/endpoints'
import CreateScheduleModal from './CreateScheduleModal'

const TAB_ALL = 'all'
const TAB_PENDING = 'pending'
const TAB_ASSIGNED = 'assigned'
const TAB_IN_PROGRESS = 'in_progress'
const TAB_COMPLETED = 'completed'

function getJobStage(row) {
  const completed = (row.inspection_status || '').toLowerCase() === 'completed' || !!row.inspection_completed_at
  if (completed) return TAB_COMPLETED
  const hasInspector = !!row.job_ticket_id && !!row.inspector_name
  if (!hasInspector) return TAB_PENDING
  const inProgress = (row.inspection_status || '').toLowerCase() === 'in_progress' || (row.inspection_status && !completed)
  if (inProgress) return TAB_IN_PROGRESS
  return TAB_ASSIGNED
}

function MyJobs() {
  const { user } = useAuth()
  const isOwner = user?.role === 'owner'
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState(TAB_ALL)
  const [detailJob, setDetailJob] = useState(null)
  const [reportData, setReportData] = useState(null)
  const [reportLoading, setReportLoading] = useState(false)
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false)

  const fetchJobs = useCallback(async () => {
    if (!isOwner) return
    setLoading(true)
    setError('')
    try {
      const data = await inspectionServices.getMyJobs()
      setJobs(Array.isArray(data) ? data : [])
    } catch (err) {
      const detail = err.response?.data?.detail ?? err.message ?? 'Failed to load your jobs'
      setError(Array.isArray(detail) ? detail.join(' ') : String(detail))
      setJobs([])
    } finally {
      setLoading(false)
    }
  }, [isOwner])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  if (!isOwner) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Jobs</h1>
        <p className="text-slate-500 text-sm">This page is only available to property owners.</p>
      </div>
    )
  }

  const formatDate = (d) => {
    if (!d) return '—'
    const date = typeof d === 'string' ? new Date(d) : d
    return date.toLocaleDateString(undefined, { dateStyle: 'medium' })
  }

  const formatDateTime = (d) => {
    if (!d) return '—'
    const date = typeof d === 'string' ? new Date(d) : d
    return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
  }

  const statusBadge = (status) => {
    if (!status) return null
    const lower = String(status).toLowerCase()
    const isComplete = lower === 'completed' || lower === 'done'
    const isPending = lower === 'pending' || lower === 'scheduled'
    const isInProgress = lower === 'in_progress' || lower === 'in progress'
    const cls = isComplete
      ? 'bg-emerald-100 text-emerald-800'
      : isPending
        ? 'bg-amber-100 text-amber-800'
        : isInProgress
          ? 'bg-sky-100 text-sky-800'
          : 'bg-violet-100 text-violet-800'
    return (
      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${cls}`}>
        {status}
      </span>
    )
  }

  const tabs = [
    { key: TAB_ALL, label: 'All' },
    { key: TAB_PENDING, label: 'Pending' },
    { key: TAB_ASSIGNED, label: 'Assigned' },
    { key: TAB_IN_PROGRESS, label: 'In progress' },
    { key: TAB_COMPLETED, label: 'Completed' },
  ]

  const filteredJobs = jobs.filter((row) => {
    if (activeTab === TAB_ALL) return true
    return getJobStage(row) === activeTab
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Jobs</h1>
          <p className="text-slate-500 text-sm mt-1">
            View your inspection requests and their status (assignment and completion).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setScheduleModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 text-white font-medium hover:bg-violet-700 shadow-sm shrink-0"
          >
            <Calendar className="w-4 h-4" /> Schedule inspection
          </button>
          <button
            type="button"
            onClick={() => fetchJobs()}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 disabled:opacity-50 shrink-0 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-100 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-12 h-12 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center">
              <ClipboardList className="w-6 h-6" />
            </span>
            <div>
              <h2 className="font-semibold text-slate-900 text-lg">Your inspection jobs</h2>
              <p className="text-slate-500 text-sm mt-0.5">Schedules you created and their current status</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {tabs.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                  activeTab === key
                    ? 'bg-violet-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-500">
            <Loader2 className="w-10 h-10 animate-spin text-violet-500 mb-3" />
            <p className="text-sm font-medium">Loading your jobs…</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-500">
            <span className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <ClipboardList className="w-10 h-10 text-slate-400" />
            </span>
            <p className="font-semibold text-slate-700">No jobs yet</p>
            <p className="text-sm mt-1 text-slate-500">Schedule an inspection using the button above.</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <p className="font-medium text-slate-600">No jobs in this category.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200 bg-slate-50">
                  <th className="py-4 px-6">Property</th>
                  <th className="py-4 px-6">Package</th>
                  <th className="py-4 px-6">Scheduled</th>
                  <th className="py-4 px-6">Assigned to</th>
                  <th className="py-4 px-6">Assigned on</th>
                  <th className="py-4 px-6">Job status</th>
                  <th className="py-4 px-6">Completed on</th>
                  <th className="py-4 px-6 w-28 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredJobs.map((row) => (
                  <tr key={row.schedule_id} className="hover:bg-violet-50/30 transition-colors">
                    <td className="py-4 px-6">
                      <span className="font-medium text-slate-900 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                        {row.property_address || '—'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-600">{row.package_name || '—'}</td>
                    <td className="py-4 px-6 text-slate-600 text-sm">{formatDate(row.scheduled_date)}</td>
                    <td className="py-4 px-6 text-slate-600">{row.inspector_name || 'Not assigned'}</td>
                    <td className="py-4 px-6 text-slate-600 text-sm">{formatDate(row.assigned_at)}</td>
                    <td className="py-4 px-6">{statusBadge(row.job_ticket_status)}</td>
                    <td className="py-4 px-6 text-slate-600 text-sm">{formatDate(row.inspection_completed_at)}</td>
                    <td className="py-4 px-6 text-right">
                      <button
                        type="button"
                        onClick={() => setDetailJob(row)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition"
                      >
                        <Eye className="w-4 h-4" /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {detailJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => { setDetailJob(null); setReportData(null) }} aria-hidden />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white shrink-0">
              <h2 className="text-lg font-semibold text-slate-900">Job details</h2>
              <button
                type="button"
                onClick={() => { setDetailJob(null); setReportData(null) }}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Property</p>
                  <p className="font-medium text-slate-900 mt-0.5">{detailJob.property_address || '—'}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Package</p>
                  <p className="font-medium text-slate-900 mt-0.5">{detailJob.package_name || '—'}</p>
                </div>
              </div>
              <div className="border-t border-slate-100 pt-4">
                <p className="text-sm font-medium text-slate-700 mb-3">Timeline</p>
                <ul className="space-y-4">
                  <li className="flex gap-3">
                    <span className="shrink-0 w-10 h-10 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center">
                      <Calendar className="w-5 h-5" />
                    </span>
                    <div>
                      <p className="font-medium text-slate-800">Request created</p>
                      <p className="text-sm text-slate-500">{formatDateTime(detailJob.created_at)}</p>
                      <p className="text-xs text-slate-400">Scheduled: {formatDate(detailJob.scheduled_date)}</p>
                    </div>
                  </li>
                  {detailJob.assigned_at && (
                    <li className="flex gap-3">
                      <span className="shrink-0 w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
                        <UserPlus className="w-5 h-5" />
                      </span>
                      <div>
                        <p className="font-medium text-slate-800">Assigned to {detailJob.inspector_name || 'Inspector'}</p>
                        <p className="text-sm text-slate-500">{formatDateTime(detailJob.assigned_at)}</p>
                      </div>
                    </li>
                  )}
                  {detailJob.inspection_completed_at && (
                    <li className="flex gap-3">
                      <span className="shrink-0 w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5" />
                      </span>
                      <div>
                        <p className="font-medium text-slate-800">Inspection completed</p>
                        <p className="text-sm text-slate-500">{formatDateTime(detailJob.inspection_completed_at)}</p>
                      </div>
                    </li>
                  )}
                </ul>
              </div>

              <div className="border-t border-slate-100 pt-4">
                {reportData === null && !reportLoading && (
                  <button
                    type="button"
                    onClick={async () => {
                      setReportLoading(true)
                      setReportData(null)
                      try {
                        const data = await inspectionServices.getOwnerJobReport(detailJob.schedule_id)
                        setReportData(data)
                      } catch (err) {
                        if (err.response?.status === 404) {
                          setReportData('unavailable')
                        } else {
                          setReportData('error')
                        }
                      } finally {
                        setReportLoading(false)
                      }
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-50 text-violet-700 font-medium hover:bg-violet-100 transition"
                  >
                    <FileText className="w-4 h-4" /> View report
                  </button>
                )}
                {reportLoading && (
                  <div className="flex items-center gap-2 text-slate-500">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading report…
                  </div>
                )}
                {reportData === 'unavailable' && (
                  <p className="text-sm text-slate-500">Report not yet available. The inspector may still be working on this job.</p>
                )}
                {reportData === 'error' && (
                  <p className="text-sm text-red-600">Failed to load report.</p>
                )}
                {reportData && typeof reportData === 'object' && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-slate-700 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-violet-500" /> Inspection report
                    </p>
                    <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 space-y-3">
                      <div className="flex flex-wrap gap-4 text-sm">
                        <span><strong className="text-slate-700">Status:</strong> {reportData.overall_status ?? '—'}</span>
                        {reportData.start_time && <span className="text-slate-600">Started: {formatDateTime(reportData.start_time)}</span>}
                        {reportData.end_time && <span className="text-slate-600">Ended: {formatDateTime(reportData.end_time)}</span>}
                      </div>
                      {reportData.checklist_results?.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Checklist</p>
                          <ul className="space-y-1.5">
                            {reportData.checklist_results.map((item, i) => (
                              <li key={i} className="flex gap-2 text-sm">
                                <span className="font-medium text-slate-700">{item.area_name}:</span>
                                <span className={item.status === 'fail' ? 'text-red-600' : 'text-slate-600'}>{item.status}</span>
                                {item.remark && <span className="text-slate-500">— {item.remark}</span>}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {reportData.report_notes && (
                        <div>
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Summary</p>
                          <p className="text-sm text-slate-700 whitespace-pre-wrap">{reportData.report_notes}</p>
                        </div>
                      )}
                      {reportData.evidence?.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Evidence</p>
                          <div className="flex flex-wrap gap-2">
                            {reportData.evidence.map((ev) => (
                              <a
                                key={ev.id}
                                href={ev.media_url?.startsWith('http') ? ev.media_url : `${endpoint.BASE_URL}${ev.media_url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-sm text-slate-700 hover:bg-slate-50"
                              >
                                {ev.media_type === 'photo' ? <Image className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                                {ev.area_name ? `${ev.area_name} (${ev.media_type})` : ev.media_type}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                      {reportData.red_flags?.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Red flags
                          </p>
                          <ul className="space-y-2">
                            {reportData.red_flags.map((rf) => (
                              <li key={rf.id} className="rounded-lg border border-amber-200 bg-amber-50/80 px-3 py-2 text-sm">
                                <span className="font-medium text-amber-800">{rf.category}</span>
                                {rf.severity && <span className="text-amber-700 ml-2">({rf.severity})</span>}
                                <p className="text-slate-700 mt-0.5">{rf.description}</p>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {reportData.report_url && (
                        <a
                          href={reportData.report_url.startsWith('http') ? reportData.report_url : `${endpoint.BASE_URL}${reportData.report_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-violet-600 hover:underline font-medium"
                        >
                          Open report (HTML)
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <CreateScheduleModal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        onSuccess={() => {
          setScheduleModalOpen(false)
          fetchJobs()
        }}
      />
    </div>
  )
}

export default MyJobs
