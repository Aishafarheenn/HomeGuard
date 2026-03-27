import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Calendar, CheckCircle, FileText, Image, Loader2, MapPin, Package, UserPlus, Video, AlertTriangle, Star } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { inspectionServices } from '../../services/requests/inspectionServices'
import { feedbackService } from '../../services/requests/feedbackService'
import { endpoint } from '../../services/endpoints'

function OwnerJobDetail() {
  const { user } = useAuth()
  const isOwner = user?.role === 'owner'
  const { scheduleId } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [job, setJob] = useState(null)
  const [pkgDetail, setPkgDetail] = useState(null)
  const [pkgChecklist, setPkgChecklist] = useState([])
  const [reportData, setReportData] = useState(null)
  const [reportLoading, setReportLoading] = useState(false)
  const [inspectionFeedback, setInspectionFeedback] = useState(null)
  const [feedbackLoading, setFeedbackLoading] = useState(false)
  const [newRating, setNewRating] = useState(5)
  const [newComment, setNewComment] = useState('')
  const [submittingFeedback, setSubmittingFeedback] = useState(false)
  const [feedbackError, setFeedbackError] = useState('')

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '—')
  const formatDateTime = (d) => (d ? new Date(d).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—')
  const paymentStatus = String(job?.payment_status ?? 'unpaid').toLowerCase()

  const paymentBadge = (status) => {
    const s = String(status || 'unpaid').toLowerCase()
    if (s === 'verified') {
      return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">Verified</span>
    }
    if (s === 'pending') {
      return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">Pending verification</span>
    }
    if (s === 'rejected') {
      return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">Rejected</span>
    }
    return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">Unpaid</span>
  }

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!isOwner) return
      setLoading(true)
      setError('')
      try {
        const rows = await inspectionServices.getMyJobs()
        const found = (Array.isArray(rows) ? rows : []).find((r) => String(r.schedule_id) === String(scheduleId))
        if (!found) {
          if (!cancelled) setError('Job not found.')
          return
        }
        if (!cancelled) setJob(found)
      } catch (e) {
        if (!cancelled) setError(e?.response?.data?.detail ?? e?.message ?? 'Failed to load job details')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [isOwner, scheduleId])

  useEffect(() => {
    if (!job?.package_id) return
    let cancelled = false
    async function loadPackage() {
      try {
        const [p, items] = await Promise.all([
          inspectionServices.getPackage(job.package_id),
          inspectionServices.getChecklistItemsByPackage(job.package_id),
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
      }
    }
    loadPackage()
    return () => {
      cancelled = true
    }
  }, [job?.package_id])

  useEffect(() => {
    if (!job?.schedule_id) return
    let cancelled = false
    async function loadReport() {
      setReportLoading(true)
      try {
        const data = await inspectionServices.getOwnerJobReport(job.schedule_id)
        if (!cancelled) setReportData(data)
      } catch (e) {
        if (!cancelled) {
          setReportData(e?.response?.status === 404 ? 'unavailable' : 'error')
        }
      } finally {
        if (!cancelled) setReportLoading(false)
      }
    }
    loadReport()
    return () => {
      cancelled = true
    }
  }, [job?.schedule_id])

  useEffect(() => {
    if (!job?.inspection_id) {
      setInspectionFeedback(null)
      return
    }
    let cancelled = false
    async function loadFeedback() {
      setFeedbackLoading(true)
      try {
        const rows = await feedbackService.getInspectionReviews()
        const match = (Array.isArray(rows) ? rows : []).find(
          (r) => String(r.inspection_id) === String(job.inspection_id)
        )
        if (!cancelled) setInspectionFeedback(match ?? null)
      } catch {
        if (!cancelled) setInspectionFeedback(null)
      } finally {
        if (!cancelled) setFeedbackLoading(false)
      }
    }
    loadFeedback()
    return () => {
      cancelled = true
    }
  }, [job?.inspection_id])

  const canPay = useMemo(() => (job?.payment_status ?? '').toLowerCase() !== 'verified', [job?.payment_status])
  const canRateInspection = useMemo(
    () =>
      !!job?.inspection_id &&
      (job?.inspection_status || '').toLowerCase() === 'completed' &&
      !inspectionFeedback,
    [job?.inspection_id, job?.inspection_status, inspectionFeedback]
  )

  const handleSubmitFeedback = async (e) => {
    e.preventDefault()
    if (!job?.inspection_id || !newComment.trim()) return
    setSubmittingFeedback(true)
    setFeedbackError('')
    try {
      await feedbackService.createInspectionReview({
        inspection_id: job.inspection_id,
        rating: newRating,
        comment: newComment.trim(),
      })
      const rows = await feedbackService.getInspectionReviews()
      const match = (Array.isArray(rows) ? rows : []).find(
        (r) => String(r.inspection_id) === String(job.inspection_id)
      )
      setInspectionFeedback(match ?? null)
      setNewComment('')
      setNewRating(5)
    } catch (err) {
      const detail = err?.response?.data?.detail ?? err?.message ?? 'Failed to submit feedback'
      setFeedbackError(Array.isArray(detail) ? detail.join(' ') : String(detail))
    } finally {
      setSubmittingFeedback(false)
    }
  }

  if (!isOwner) return <p className="text-slate-500">This page is only available to property owners.</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Job details</h1>
          <p className="text-slate-500 text-sm mt-1">Full details for your selected inspection job.</p>
        </div>
        <button type="button" onClick={() => navigate('/dashboard/my-jobs')} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      {loading ? (
        <div className="py-16 flex items-center justify-center text-slate-500"><Loader2 className="w-8 h-8 animate-spin mr-2" />Loading…</div>
      ) : error ? (
        <div className="rounded-xl bg-red-50 border border-red-100 text-red-700 px-4 py-3 text-sm">{String(error)}</div>
      ) : !job ? null : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100"><p className="text-xs text-slate-500 uppercase">Property</p><p className="font-medium text-slate-900 mt-1 flex items-center gap-1"><MapPin className="w-4 h-4 text-slate-400" />{job.property_address || '—'}</p></div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100"><p className="text-xs text-slate-500 uppercase">Package</p><p className="font-medium text-slate-900 mt-1">{job.package_name || '—'}</p></div>
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-3">
            <p className="text-sm font-medium text-slate-700">Timeline</p>
            <p className="text-sm text-slate-600 flex items-center gap-2"><Calendar className="w-4 h-4 text-violet-600" /> Request created: {formatDateTime(job.created_at)} (scheduled {formatDate(job.scheduled_date)})</p>
            {job.assigned_at && <p className="text-sm text-slate-600 flex items-center gap-2"><UserPlus className="w-4 h-4 text-sky-600" /> Assigned to {job.inspector_name || 'Inspector'} on {formatDateTime(job.assigned_at)}</p>}
            {job.inspection_completed_at && <p className="text-sm text-slate-600 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-600" /> Inspection completed on {formatDateTime(job.inspection_completed_at)}</p>}
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <p className="text-sm font-medium text-slate-800 mb-3">Payment details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-slate-500">Status</p>
                <div className="mt-1">{paymentBadge(paymentStatus)}</div>
              </div>
              <div>
                <p className="text-slate-500">Amount</p>
                <p className="font-semibold text-slate-900 mt-1">
                  {job.package_price != null ? `₹${Number(job.package_price).toLocaleString()}` : '—'}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Submitted at</p>
                <p className="text-slate-800 mt-1">{formatDateTime(job.payment_submitted_at)}</p>
              </div>
              <div>
                <p className="text-slate-500">Verified at</p>
                <p className="text-slate-800 mt-1">{formatDateTime(job.payment_verified_at)}</p>
              </div>
            </div>
          </div>

          {job.package_id && (
            <div className="rounded-xl border border-violet-100 bg-violet-50/40 p-4">
              <p className="text-sm font-medium text-violet-900 flex items-center gap-2 mb-2"><Package className="w-4 h-4" /> Package details</p>
              {pkgDetail?.description && <p className="text-sm text-slate-700">{pkgDetail.description}</p>}
              {pkgDetail?.price != null && <p className="text-sm font-semibold text-violet-800 mt-2">Price: ₹{Number(pkgDetail.price).toLocaleString()}</p>}
              {pkgChecklist.length > 0 && (
                <ul className="list-disc list-inside text-sm text-slate-700 mt-2 space-y-0.5">
                  {pkgChecklist.map((c) => <li key={c.id}>{c.area_name}</li>)}
                </ul>
              )}
            </div>
          )}

          {canPay && (
            <button type="button" onClick={() => navigate(`/dashboard/payments?schedule_id=${job.schedule_id}`)} className="px-4 py-2 rounded-xl bg-violet-600 text-white hover:bg-violet-700">
              Pay now
            </button>
          )}

          <div className="border-t border-slate-100 pt-4">
            <p className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2"><FileText className="w-4 h-4 text-violet-500" /> Inspection report</p>
            {reportLoading && <p className="text-sm text-slate-500">Loading report…</p>}
            {reportData === 'unavailable' && <p className="text-sm text-slate-500">Report not yet available.</p>}
            {reportData === 'error' && <p className="text-sm text-red-600">Failed to load report.</p>}
            {reportData && typeof reportData === 'object' && (
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 space-y-3">
                <p className="text-sm"><strong>Status:</strong> {reportData.overall_status ?? '—'}</p>
                {reportData.checklist_results?.length > 0 && (
                  <ul className="space-y-1 text-sm">
                    {reportData.checklist_results.map((item, i) => <li key={i}><strong>{item.area_name}:</strong> {item.status}{item.remark ? ` - ${item.remark}` : ''}</li>)}
                  </ul>
                )}
                {reportData.evidence?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {reportData.evidence.map((ev) => (
                      <a key={ev.id} href={ev.media_url?.startsWith('http') ? ev.media_url : `${endpoint.BASE_URL}${ev.media_url}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-sm text-slate-700 hover:bg-slate-50">
                        {ev.media_type === 'photo' ? <Image className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                        {ev.area_name ? `${ev.area_name} (${ev.media_type})` : ev.media_type}
                      </a>
                    ))}
                  </div>
                )}
                {reportData.red_flags?.length > 0 && (
                  <ul className="space-y-2">
                    {reportData.red_flags.map((rf) => (
                      <li key={rf.id} className="rounded-lg border border-amber-200 bg-amber-50/80 px-3 py-2 text-sm">
                        <span className="font-medium text-amber-800 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" />{rf.category}</span>
                        <p className="text-slate-700 mt-0.5">{rf.description}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 pt-4">
            <p className="text-sm font-medium text-slate-700 mb-2">Inspection feedback</p>
            {feedbackLoading ? (
              <p className="text-sm text-slate-500">Loading feedback…</p>
            ) : inspectionFeedback ? (
              <div className="rounded-xl bg-violet-50/50 border border-violet-100 p-4">
                <div className="flex items-center gap-1 text-amber-500 mb-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      className={`w-4 h-4 ${n <= Number(inspectionFeedback.rating || 0) ? 'fill-current' : ''}`}
                    />
                  ))}
                </div>
                <p className="text-sm text-slate-700">{inspectionFeedback.comment || '—'}</p>
                <p className="text-xs text-slate-500 mt-2">
                  Submitted on {formatDateTime(inspectionFeedback.created_at)}
                </p>
              </div>
            ) : canRateInspection ? (
              <form onSubmit={handleSubmitFeedback} className="rounded-xl bg-violet-50/50 border border-violet-100 p-4 space-y-3">
                {feedbackError && (
                  <div className="rounded-lg bg-red-50 border border-red-100 text-red-700 px-3 py-2 text-sm">{feedbackError}</div>
                )}
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-1.5">Your rating</p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setNewRating(n)}
                        className={`p-1.5 rounded-lg border ${newRating >= n ? 'border-amber-300 bg-amber-50 text-amber-600' : 'border-slate-200 text-slate-400'}`}
                        aria-label={`${n} stars`}
                      >
                        <Star className={`w-4 h-4 ${newRating >= n ? 'fill-current' : ''}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Your comment</label>
                  <textarea
                    rows={3}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                    placeholder="Share your inspection experience"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={submittingFeedback || !newComment.trim()}
                  className="px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-50"
                >
                  {submittingFeedback ? 'Submitting…' : 'Submit feedback'}
                </button>
              </form>
            ) : (
              <p className="text-sm text-slate-500">
                {job.inspection_id
                  ? 'No feedback submitted yet for this inspection.'
                  : 'Feedback will appear after inspection completion.'}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default OwnerJobDetail
