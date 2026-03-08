import React, { useEffect, useState, useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Play, CheckCircle, Loader2, FileText, Save, MapPin, User, Package, Calendar, ClipboardList } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { createJobticketApi } from '../../services/requests/CreateJobticket'
import { inspectionServices, reportServices } from '../../services/requests/inspectionServices'

function ChecklistRow({ item, result, onSave, saving }) {
  const [status, setStatus] = useState(result?.status ?? 'pass')
  const [remark, setRemark] = useState(result?.remark ?? '')
  useEffect(() => {
    setStatus(result?.status ?? 'pass')
    setRemark(result?.remark ?? '')
  }, [result?.status, result?.remark])
  return (
    <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-slate-50/80 border border-slate-100 hover:border-slate-200 transition-colors">
      <span className="text-sm font-medium text-slate-800 shrink-0 min-w-[6rem]">
        {item.area_name || item.id}
      </span>
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium bg-white focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400"
      >
        <option value="pass">Pass</option>
        <option value="fail">Fail</option>
        <option value="na">N/A</option>
      </select>
      <input
        type="text"
        value={remark}
        onChange={(e) => setRemark(e.target.value)}
        placeholder="Remark (optional)"
        className="flex-1 min-w-[120px] px-3 py-2 rounded-lg border border-slate-200 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400"
      />
      <button
        type="button"
        onClick={() => onSave(item, status, remark)}
        disabled={saving}
        className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-50 transition"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Save
      </button>
    </div>
  )
}

function JobTicketDetail() {
  const { ticketId } = useParams()
  const { user } = useAuth()
  const isInspector = user?.role === 'inspector'
  const canUpdate = user?.role === 'admin' || isInspector

  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [starting, setStarting] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [packageId, setPackageId] = useState(null)
  const [checklistItems, setChecklistItems] = useState([])
  const [checklistResults, setChecklistResults] = useState([])
  const [reportNotes, setReportNotes] = useState('')
  const [existingReportId, setExistingReportId] = useState(null)
  const [reportSaving, setReportSaving] = useState(false)
  const [checklistSaving, setChecklistSaving] = useState(false)

  const fetchTicket = useCallback(async () => {
    if (!ticketId) return
    setLoading(true)
    setError(null)
    try {
      const data = await createJobticketApi.getJobticket(ticketId)
      setTicket(data)
    } catch (err) {
      if (err.response?.status === 403 || err.response?.status === 404) {
        setError('You do not have access to this job or it was not found.')
      } else {
        setError(err.response?.data?.detail ?? err.message ?? 'Failed to load job')
      }
      setTicket(null)
    } finally {
      setLoading(false)
    }
  }, [ticketId])

  useEffect(() => {
    fetchTicket()
  }, [fetchTicket])

  useEffect(() => {
    if (!ticket) return
    const insp = (ticket.inspections || []).length > 0
      ? ticket.inspections.sort((a, b) => {
          const ta = a.end_time || a.start_time || 0
          const tb = b.end_time || b.start_time || 0
          return new Date(tb) - new Date(ta)
        })[0]
      : null
    if (!insp || !ticket.schedule?.package_id) {
      setPackageId(null)
      setChecklistItems([])
      setChecklistResults([])
      setReportNotes('')
      setExistingReportId(null)
      return
    }
    const pId = ticket.schedule.package_id
    setPackageId(pId)
    let cancelled = false
    Promise.all([
      inspectionServices.getChecklistItemsByPackage(pId),
      inspectionServices.getChecklistResultsByInspection(insp.id),
      reportServices.getInspectionReports(insp.id),
    ]).then(([items, results, reports]) => {
      if (cancelled) return
      setChecklistItems(Array.isArray(items) ? items : [])
      setChecklistResults(Array.isArray(results) ? results : [])
      const first = Array.isArray(reports) && reports.length > 0 ? reports[0] : null
      setReportNotes(first?.report_notes ?? '')
      setExistingReportId(first?.id ?? null)
    }).catch(() => { if (!cancelled) setChecklistItems([]) })
    return () => { cancelled = true }
  }, [ticket?.id, ticket?.inspections, ticket?.schedule?.package_id])

  const getLatestInspection = () => {
    if (!ticket?.inspections?.length) return null
    const sorted = [...ticket.inspections].sort((a, b) => {
      const ta = a.end_time || a.start_time || 0
      const tb = b.end_time || b.start_time || 0
      return new Date(tb) - new Date(ta)
    })
    return sorted[0]
  }

  const getResultForItem = (itemId) =>
    checklistResults.find((r) => r.checklist_item_id === itemId)

  const handleStart = async () => {
    setStarting(true)
    setError(null)
    try {
      const now = new Date().toISOString()
      await inspectionServices.createInspection({
        job_ticket_id: ticket.id,
        start_time: now,
        end_time: now,
        overall_status: 'in_progress',
      })
      await fetchTicket()
    } catch (err) {
      setError(err.response?.data?.detail ?? err.message ?? 'Failed to start job')
    } finally {
      setStarting(false)
    }
  }

  const handleSaveChecklistItem = async (item, status, remark) => {
    const insp = getLatestInspection()
    if (!insp) return
    const existing = getResultForItem(item.id)
    setChecklistSaving(true)
    try {
      if (existing) {
        await inspectionServices.updateChecklistResult(existing.id, { status: status || 'pass', remark: remark || '' })
      } else {
        await inspectionServices.createChecklistResult({
          inspection_id: insp.id,
          checklist_item_id: item.id,
          status: status || 'pass',
          remark: remark || '',
        })
      }
      const results = await inspectionServices.getChecklistResultsByInspection(insp.id)
      setChecklistResults(Array.isArray(results) ? results : [])
    } catch (err) {
      setError(err.response?.data?.detail ?? err.message ?? 'Save failed')
    } finally {
      setChecklistSaving(false)
    }
  }

  const handleSaveReportNotes = async () => {
    const insp = getLatestInspection()
    if (!insp) return
    setReportSaving(true)
    try {
      if (existingReportId) {
        await reportServices.updateInspectionReport(existingReportId, { report_notes: reportNotes })
      } else {
        const created = await reportServices.createInspectionReport({
          inspection_id: insp.id,
          report_notes: reportNotes,
        })
        setExistingReportId(created?.id ?? null)
      }
    } catch (err) {
      setError(err.response?.data?.detail ?? err.message ?? 'Save failed')
    } finally {
      setReportSaving(false)
    }
  }

  const handleComplete = async () => {
    const insp = getLatestInspection()
    if (!insp) return
    const hasEntry = checklistResults.length >= 1 || (reportNotes.trim() !== '' || !!existingReportId)
    if (!hasEntry) return
    setCompleting(true)
    setError(null)
    try {
      await inspectionServices.updateInspection(insp.id, {
        overall_status: 'completed',
        end_time: new Date().toISOString(),
      })
      await fetchTicket()
    } catch (err) {
      setError(err.response?.data?.detail ?? err.message ?? 'Failed to complete')
    } finally {
      setCompleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[280px] text-slate-500">
        <Loader2 className="w-10 h-10 animate-spin text-violet-500 mb-4" />
        <p className="text-sm font-medium">Loading job…</p>
      </div>
    )
  }

  if (error && !ticket) {
    return (
      <div className="space-y-6">
        <Link
          to="/dashboard/jobtickets"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-violet-600 font-medium transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to job tickets
        </Link>
        <div className="rounded-2xl bg-red-50 border border-red-100 text-red-700 px-5 py-4 text-sm">
          {error}
        </div>
      </div>
    )
  }

  const status = (ticket?.status || '').toLowerCase()
  const inspection = getLatestInspection()
  const isAssigned = status === 'assigned' && !inspection
  const isInProgress = status === 'in_progress' && inspection && (inspection.overall_status || '').toLowerCase() !== 'completed'
  const isCompleted = status === 'completed' || (inspection?.overall_status || '').toLowerCase() === 'completed'
  const hasEntry = checklistResults.length >= 1 || reportNotes.trim() !== ''
  const canComplete = hasEntry && isInProgress

  const statusBadgeClass =
    status === 'completed'
      ? 'bg-emerald-100 text-emerald-800'
      : status === 'in_progress'
        ? 'bg-sky-100 text-sky-800'
        : 'bg-violet-100 text-violet-800'

  return (
    <div className="space-y-6">
      <Link
        to="/dashboard/jobtickets"
        className="inline-flex items-center gap-2 text-slate-600 hover:text-violet-600 font-medium transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to job tickets
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-br from-slate-50 via-white to-violet-50/30">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                {ticket?.schedule?.property?.address ?? ticket?.schedule_id ?? '—'}
              </h1>
              <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
                <span>{ticket?.schedule?.package?.name ?? '—'}</span>
                <span>·</span>
                <span>Scheduled {ticket?.schedule?.scheduled_date ? new Date(ticket.schedule.scheduled_date).toLocaleDateString(undefined, { dateStyle: 'long' }) : '—'}</span>
              </p>
            </div>
            <span className={`inline-flex px-3 py-1.5 rounded-full text-sm font-medium ${statusBadgeClass}`}>
              {ticket?.status ?? '—'}
            </span>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50/80 border border-slate-100">
              <span className="w-10 h-10 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Property</p>
                <p className="font-medium text-slate-900 truncate">{ticket?.schedule?.property?.address ?? '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50/80 border border-slate-100">
              <span className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                <User className="w-5 h-5" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Owner</p>
                <p className="font-medium text-slate-900 truncate">{ticket?.schedule?.owner?.full_name ?? '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50/80 border border-slate-100">
              <span className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <Package className="w-5 h-5" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Package</p>
                <p className="font-medium text-slate-900 truncate">{ticket?.schedule?.package?.name ?? '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50/80 border border-slate-100">
              <span className="w-10 h-10 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Assigned</p>
                <p className="font-medium text-slate-900">
                  {ticket?.assigned_at ? new Date(ticket.assigned_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-100 text-red-700 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {isAssigned && canUpdate && (
            <div className="pt-2">
              <div className="p-5 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50">
                <p className="text-sm text-slate-600 mb-4">Start this job when you begin the inspection.</p>
                <button
                  type="button"
                  onClick={handleStart}
                  disabled={starting}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50 shadow-sm shadow-emerald-500/20 transition"
                >
                  {starting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                  Start job
                </button>
              </div>
            </div>
          )}

          {isInProgress && canUpdate && (
            <div className="pt-4 border-t border-slate-100 space-y-6">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center">
                  <ClipboardList className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="font-semibold text-slate-900">Inspection details</h2>
                  <p className="text-sm text-slate-500">Add at least one checklist result or report note, then complete the job.</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-3">Checklist</p>
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {checklistItems.map((item) => (
                    <ChecklistRow
                      key={item.id}
                      item={item}
                      result={getResultForItem(item.id)}
                      onSave={handleSaveChecklistItem}
                      saving={checklistSaving}
                    />
                  ))}
                  {checklistItems.length === 0 && (
                    <p className="text-sm text-slate-500 py-4">No checklist items for this package.</p>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <p className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-500" /> Report notes
                </p>
                <textarea
                  value={reportNotes}
                  onChange={(e) => setReportNotes(e.target.value)}
                  placeholder="What you did / Summary…"
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 bg-white"
                />
                <button
                  type="button"
                  onClick={handleSaveReportNotes}
                  disabled={reportSaving}
                  className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-300 disabled:opacity-50 transition"
                >
                  {reportSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save notes
                </button>
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={handleComplete}
                  disabled={!canComplete || completing}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-emerald-500/20 transition"
                >
                  {completing ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                  Complete job
                </button>
                {!hasEntry && (
                  <p className="text-sm text-amber-700">Add at least one checklist item or report note to enable Complete.</p>
                )}
              </div>
            </div>
          )}

          {isCompleted && inspection && (
            <div className="pt-4 border-t border-slate-100 space-y-5">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="font-semibold text-slate-900">Completed inspection</h2>
                  {inspection.end_time && (
                    <p className="text-sm text-slate-500">Completed {new Date(inspection.end_time).toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' })}</p>
                  )}
                </div>
              </div>
              {checklistResults.length > 0 && (
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Checklist</p>
                  </div>
                  <ul className="divide-y divide-slate-100">
                    {checklistResults.map((r, i) => (
                      <li key={i} className="px-4 py-3 flex flex-wrap gap-2 items-baseline">
                        <span className="font-medium text-slate-800">
                          {checklistItems.find(c => c.id === r.checklist_item_id)?.area_name ?? r.checklist_item_id}:
                        </span>
                        <span className={`text-sm ${r.status === 'fail' ? 'text-red-600 font-medium' : 'text-slate-600'}`}>{r.status}</span>
                        {r.remark && <span className="text-slate-500 text-sm">— {r.remark}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {reportNotes && (
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Notes</p>
                  </div>
                  <p className="px-4 py-3 text-slate-700 whitespace-pre-wrap text-sm">{reportNotes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default JobTicketDetail
