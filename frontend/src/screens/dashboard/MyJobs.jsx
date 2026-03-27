import React, { useEffect, useState, useCallback } from 'react'
import { ClipboardList, Loader2, MapPin, RefreshCw, Eye, X, CheckCircle, UserPlus, Calendar, FileText, Image, Video, AlertTriangle, Star, CreditCard, Package, Search } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { inspectionServices } from '../../services/requests/inspectionServices'
import { feedbackService } from '../../services/requests/feedbackService'
import { endpoint } from '../../services/endpoints'
import CreateScheduleModal from './CreateScheduleModal'
import { useNavigate } from 'react-router-dom'

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
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState(TAB_ALL)
  const [searchTerm, setSearchTerm] = useState('')
  const [detailJob, setDetailJob] = useState(null)
  const [reportData, setReportData] = useState(null)
  const [reportLoading, setReportLoading] = useState(false)
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false)
  const [reviewJob, setReviewJob] = useState(null)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewError, setReviewError] = useState('')
  const [pkgDetail, setPkgDetail] = useState(null)
  const [pkgChecklist, setPkgChecklist] = useState([])
  const [pkgLoading, setPkgLoading] = useState(false)

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

  const detailPackageId = detailJob?.package_id
  useEffect(() => {
    if (!detailPackageId) {
      setPkgDetail(null)
      setPkgChecklist([])
      return
    }
    let cancelled = false
    async function loadPkg() {
      setPkgLoading(true)
      setPkgDetail(null)
      setPkgChecklist([])
      try {
        const [p, items] = await Promise.all([
          inspectionServices.getPackage(detailPackageId),
          inspectionServices.getChecklistItemsByPackage(detailPackageId),
        ])
        if (!cancelled) {
          setPkgDetail(p)
          setPkgChecklist(Array.isArray(items) ? items : [])
        }
      } catch {
        if (!cancelled) {
          setPkgDetail(null)
          setPkgChecklist([])
        }
      } finally {
        if (!cancelled) setPkgLoading(false)
      }
    }
    loadPkg()
    return () => {
      cancelled = true
    }
  }, [detailPackageId])

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

  const paymentBadge = (status) => {
    const s = (status ?? '').toLowerCase()
    if (!s || s === 'unpaid') {
      return (
        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
          Unpaid
        </span>
      )
    }
    if (s === 'pending') {
      return (
        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
          Pending verification
        </span>
      )
    }
    if (s === 'verified') {
      return (
        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
          Verified
        </span>
      )
    }
    if (s === 'rejected') {
      return (
        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
          Rejected
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
        {status ?? '—'}
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

  const tabCounts = {
    [TAB_ALL]: jobs.length,
    [TAB_PENDING]: jobs.filter((r) => getJobStage(r) === TAB_PENDING).length,
    [TAB_ASSIGNED]: jobs.filter((r) => getJobStage(r) === TAB_ASSIGNED).length,
    [TAB_IN_PROGRESS]: jobs.filter((r) => getJobStage(r) === TAB_IN_PROGRESS).length,
    [TAB_COMPLETED]: jobs.filter((r) => getJobStage(r) === TAB_COMPLETED).length,
  }

  const filteredJobs = jobs.filter((row) => {
    const stageMatches = activeTab === TAB_ALL ? true : getJobStage(row) === activeTab
    if (!stageMatches) return false
    if (!searchTerm.trim()) return true
    const q = searchTerm.trim().toLowerCase()
    return (
      String(row.property_address || '').toLowerCase().includes(q) ||
      String(row.package_name || '').toLowerCase().includes(q) ||
      String(row.inspector_name || '').toLowerCase().includes(q)
    )
  })

  const kpis = [
    { key: 'total', label: 'Total jobs', value: jobs.length, cls: 'bg-violet-100 text-violet-700' },
    { key: 'pending', label: 'Pending', value: tabCounts[TAB_PENDING], cls: 'bg-amber-100 text-amber-700' },
    { key: 'progress', label: 'In progress', value: tabCounts[TAB_IN_PROGRESS], cls: 'bg-sky-100 text-sky-700' },
    { key: 'done', label: 'Completed', value: tabCounts[TAB_COMPLETED], cls: 'bg-emerald-100 text-emerald-700' },
  ]

  const canRateInspector = (row) => {
    const completed = (row.inspection_status || '').toLowerCase() === 'completed' || !!row.inspection_completed_at
    return (
      completed &&
      row.inspection_id &&
      row.inspector_id &&
      !row.has_owner_review
    )
  }

  const submitInspectionReview = async (e) => {
    e.preventDefault()
    if (!reviewJob?.inspection_id || !reviewComment.trim()) return
    setReviewSubmitting(true)
    setReviewError('')
    try {
      await feedbackService.createInspectionReview({
        inspection_id: reviewJob.inspection_id,
        rating: reviewRating,
        comment: reviewComment.trim(),
      })
      setReviewJob(null)
      setReviewComment('')
      setReviewRating(5)
      await fetchJobs()
    } catch (err) {
      const detail = err.response?.data?.detail ?? err.message ?? 'Failed to submit review'
      setReviewError(Array.isArray(detail) ? detail.join(' ') : String(detail))
    } finally {
      setReviewSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Jobs</h1>
          <p className="text-slate-500 text-sm mt-1">
            Track your inspection lifecycle from scheduling to reports and feedback.
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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.key} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${kpi.cls}`}>
              {kpi.label}
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-3">{kpi.value}</p>
          </div>
        ))}
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
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
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
                {label} <span className={`ml-1 ${activeTab === key ? 'text-violet-100' : 'text-slate-500'}`}>({tabCounts[key] ?? 0})</span>
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by property, package, inspector"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-200"
            />
          </div>
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
            <p className="font-medium text-slate-600">No jobs match your current filters.</p>
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
                  <th className="py-4 px-6">Payment</th>
                  <th className="py-4 px-6">Completed on</th>
                  <th className="py-4 px-6 w-44 text-right">Actions</th>
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
                    <td className="py-4 px-6">{paymentBadge(row.payment_status)}</td>
                    <td className="py-4 px-6 text-slate-600 text-sm">{formatDate(row.inspection_completed_at)}</td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2 flex-wrap justify-end">
                          {row.payment_status !== 'verified' && (
                            <button
                              type="button"
                              onClick={() => navigate(`/dashboard/payments?schedule_id=${row.schedule_id}`)}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-50 text-violet-700 text-sm font-medium border border-violet-200 hover:bg-violet-100 transition"
                            >
                              <CreditCard className="w-4 h-4" /> Pay now
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => navigate(`/dashboard/my-jobs/${row.schedule_id}`)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition"
                          >
                            <Eye className="w-4 h-4" /> View details
                          </button>
                          {canRateInspector(row) && (
                            <button
                              type="button"
                              onClick={() => {
                                setReviewJob(row)
                                setReviewRating(5)
                                setReviewComment('')
                                setReviewError('')
                              }}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-amber-200 bg-amber-50 text-amber-900 text-sm font-medium hover:bg-amber-100 transition"
                            >
                              <Star className="w-4 h-4" /> Rate inspector
                            </button>
                          )}
                        </div>
                        {row.has_owner_review && (
                          <span className="text-xs text-emerald-600 font-medium">Review submitted</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {reviewJob && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4" aria-modal="true">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => !reviewSubmitting && setReviewJob(null)} aria-hidden />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Rate your inspector</h2>
              <button
                type="button"
                onClick={() => setReviewJob(null)}
                disabled={reviewSubmitting}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              {reviewJob.property_address} — {reviewJob.inspector_name}
            </p>
            {reviewError && (
              <div className="mb-4 rounded-xl bg-red-50 border border-red-100 text-red-700 px-4 py-3 text-sm">{reviewError}</div>
            )}
            <form onSubmit={submitInspectionReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setReviewRating(n)}
                      className={`p-2 rounded-lg border transition ${
                        reviewRating >= n ? 'border-amber-400 bg-amber-50 text-amber-600' : 'border-slate-200 text-slate-400'
                      }`}
                      aria-label={`${n} stars`}
                    >
                      <Star className={`w-6 h-6 ${reviewRating >= n ? 'fill-current' : ''}`} />
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-1">{reviewRating} out of 5</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Your comments</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={4}
                  required
                  placeholder="How was the inspection experience?"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewJob(null)}
                  disabled={reviewSubmitting}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewSubmitting || !reviewComment.trim()}
                  className="flex-1 py-3 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700 disabled:opacity-50"
                >
                  {reviewSubmitting ? 'Submitting…' : 'Submit review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {detailJob && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
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

              {detailJob.package_id && (
                <div className="rounded-xl border border-violet-100 bg-violet-50/40 p-4">
                  <div className="flex items-center gap-2 text-violet-900 font-medium text-sm mb-2">
                    <Package className="w-4 h-4 shrink-0" />
                    Package details
                  </div>
                  {pkgLoading ? (
                    <div className="flex items-center gap-2 text-slate-600 text-sm py-2">
                      <Loader2 className="w-4 h-4 animate-spin text-violet-600" />
                      Loading details…
                    </div>
                  ) : pkgDetail ? (
                    <div className="space-y-3">
                      {pkgDetail.description && (
                        <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{pkgDetail.description}</p>
                      )}
                      {pkgDetail.price != null && (
                        <p className="text-sm font-semibold text-violet-800">
                          Price: ₹{Number(pkgDetail.price).toLocaleString()}
                        </p>
                      )}
                      {pkgChecklist.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-slate-600 mb-1.5">Areas covered</p>
                          <ul className="list-disc list-inside text-sm text-slate-700 space-y-0.5">
                            {pkgChecklist.map((c) => (
                              <li key={c.id}>{c.area_name}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">Could not load package details.</p>
                  )}
                </div>
              )}

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
