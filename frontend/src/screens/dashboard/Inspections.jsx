import React, { useEffect, useState, useCallback } from 'react'
import { Calendar, X, ClipboardCheck, CheckCircle, Loader2, FileText, Save } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import { endpoint } from '../../services/endpoints'
import { inspectionServices, reportServices } from '../../services/requests/inspectionServices'
import { createJobticketApi } from '../../services/requests/CreateJobticket'
import CreateScheduleModal from './CreateScheduleModal'
import CreateInspectionModal from './CreateInspectionModal'

function ChecklistRow({ item, result, onSave, saving }) {
  const [status, setStatus] = useState(result?.status ?? 'pass')
  const [remark, setRemark] = useState(result?.remark ?? '')
  useEffect(() => {
    setStatus(result?.status ?? 'pass')
    setRemark(result?.remark ?? '')
  }, [result?.status, result?.remark])
  return (
    <div className="flex flex-wrap items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
      <span className="text-sm font-medium text-slate-700 shrink-0 w-24">
        {item.area_name || item.id}
      </span>
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="px-2 py-1 rounded border border-slate-200 text-sm"
      >
        <option value="pass">Pass</option>
        <option value="fail">Fail</option>
        <option value="na">N/A</option>
      </select>
      <input
        type="text"
        value={remark}
        onChange={(e) => setRemark(e.target.value)}
        placeholder="Remark"
        className="flex-1 min-w-0 px-2 py-1 rounded border border-slate-200 text-sm"
      />
      <button
        type="button"
        onClick={() => onSave(item, status, remark)}
        disabled={saving}
        className="shrink-0 px-2 py-1 rounded bg-[#A78BFA] text-white text-xs font-medium hover:bg-[#9333EA] disabled:opacity-50"
      >
        Save
      </button>
    </div>
  )
}

function Inspections() {
  const { user } = useAuth()
  const isOwner = user?.role === 'owner'
  const isInspector = user?.role === 'inspector'
  const canCreateInspection = user?.role === 'admin' || isInspector
  const canUpdateInspection = user?.role === 'admin' || isInspector
  const [inspections, setInspections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false)
  const [inspectionModalOpen, setInspectionModalOpen] = useState(false)
  const [viewInspection, setViewInspection] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)
  const [packageId, setPackageId] = useState(null)
  const [checklistItems, setChecklistItems] = useState([])
  const [checklistResults, setChecklistResults] = useState([])
  const [reportNotes, setReportNotes] = useState('')
  const [existingReportId, setExistingReportId] = useState(null)
  const [reportSaving, setReportSaving] = useState(false)
  const [checklistSaving, setChecklistSaving] = useState(false)

  const fetchInspections = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get(endpoint.inspection.inspections)
      const data = response.data
      setInspections(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
      setError('Failed to load inspections')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchInspections()
  }, [fetchInspections])

  useEffect(() => {
    if (!viewInspection || !canUpdateInspection || !viewInspection.job_ticket_id) {
      setPackageId(null)
      setChecklistItems([])
      setChecklistResults([])
      setReportNotes('')
      setExistingReportId(null)
      return
    }
    let cancelled = false
    const load = async () => {
      try {
        const ticket = await createJobticketApi.getJobticket(viewInspection.job_ticket_id)
        const pId = ticket?.schedule?.package_id
        if (cancelled || !pId) {
          setPackageId(null)
          setChecklistItems([])
          return
        }
        setPackageId(pId)
        const [items, results, reports] = await Promise.all([
          inspectionServices.getChecklistItemsByPackage(pId),
          inspectionServices.getChecklistResultsByInspection(viewInspection.id),
          reportServices.getInspectionReports(viewInspection.id),
        ])
        if (cancelled) return
        setChecklistItems(Array.isArray(items) ? items : [])
        setChecklistResults(Array.isArray(results) ? results : [])
        const firstReport = Array.isArray(reports) && reports.length > 0 ? reports[0] : null
        setReportNotes(firstReport?.report_notes ?? '')
        setExistingReportId(firstReport?.id ?? null)
      } catch (err) {
        if (!cancelled) {
          setChecklistItems([])
          setChecklistResults([])
        }
      }
    }
    load()
    return () => { cancelled = true }
  }, [viewInspection?.id, viewInspection?.job_ticket_id, canUpdateInspection])

  const getResultForItem = (itemId) =>
    checklistResults.find((r) => r.checklist_item_id === itemId)

  const handleSaveChecklistItem = async (item, status, remark) => {
    const existing = getResultForItem(item.id)
    setChecklistSaving(true)
    try {
      if (existing) {
        await inspectionServices.updateChecklistResult(existing.id, {
          status: status || 'pass',
          remark: remark || '',
        })
      } else {
        await inspectionServices.createChecklistResult({
          inspection_id: viewInspection.id,
          checklist_item_id: item.id,
          status: status || 'pass',
          remark: remark || '',
        })
      }
      const results = await inspectionServices.getChecklistResultsByInspection(viewInspection.id)
      setChecklistResults(Array.isArray(results) ? results : [])
    } catch (err) {
      const detail = err.response?.data?.detail ?? err.message ?? 'Save failed'
      setError(Array.isArray(detail) ? detail.join(' ') : String(detail))
    } finally {
      setChecklistSaving(false)
    }
  }

  const handleSaveReportNotes = async () => {
    setReportSaving(true)
    try {
      if (existingReportId) {
        await reportServices.updateInspectionReport(existingReportId, { report_notes: reportNotes })
      } else {
        const created = await reportServices.createInspectionReport({
          inspection_id: viewInspection.id,
          report_notes: reportNotes,
        })
        setExistingReportId(created?.id ?? null)
      }
    } catch (err) {
      const detail = err.response?.data?.detail ?? err.message ?? 'Save failed'
      setError(Array.isArray(detail) ? detail.join(' ') : String(detail))
    } finally {
      setReportSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Inspections</h1>
          <p className="text-slate-500 text-sm mt-1">
            {isInspector ? 'View and manage your inspections' : 'Schedule and manage property inspections'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isOwner && (
            <button
              type="button"
              onClick={() => setScheduleModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 text-white font-medium hover:bg-violet-700 transition shadow-sm shadow-violet-500/25 shrink-0"
            >
              <Calendar className="w-4 h-4" /> Schedule inspection
            </button>
          )}
          {canCreateInspection && (
            <button
              type="button"
              onClick={() => setInspectionModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-violet-200 text-violet-700 font-medium hover:bg-violet-50 transition shrink-0"
            >
              <ClipboardCheck className="w-4 h-4" /> Create inspection
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5" />
            </span>
            <div>
              <h2 className="font-semibold text-slate-900">
                {isInspector ? 'Your inspections' : 'Inspection list'}
              </h2>
              <p className="text-slate-500 text-sm mt-0.5">
                {isInspector ? 'Inspections for your assigned job tickets' : 'All scheduled and completed inspections'}
              </p>
            </div>
          </div>
        </div>
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <Loader2 className="w-10 h-10 animate-spin text-violet-500 mb-3" />
            <p className="text-sm font-medium">Loading inspections…</p>
          </div>
        )}
        {error && !loading && (
          <div className="p-6 rounded-xl mx-4 mt-4 bg-red-50 border border-red-100 text-red-700 text-sm">{error}</div>
        )}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-100 bg-slate-50/70">
                  <th className="py-3.5 px-6 font-medium">Property</th>
                  <th className="py-3.5 px-6 font-medium">Owner</th>
                  <th className="py-3.5 px-6 font-medium">Inspector</th>
                  <th className="py-3.5 px-6 font-medium">Date</th>
                  <th className="py-3.5 px-6 font-medium">Status</th>
                  <th className="py-3.5 px-6 font-medium w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {inspections.map((row) => (
                  <tr key={row.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-6 font-medium text-slate-900">
                      {row.job_ticket?.schedule?.property?.address || '—'}
                    </td>
                    <td className="py-3.5 px-6 text-slate-600">
                      {row.job_ticket?.schedule?.owner?.full_name || '—'}
                    </td>
                    <td className="py-3.5 px-6 text-slate-600">
                      {row.job_ticket?.inspector?.full_name || '—'}
                    </td>
                    <td className="py-3.5 px-6 text-slate-600">
                      {row.start_time ? new Date(row.start_time).toLocaleString() : '—'}
                    </td>
                    <td className="py-3.5 px-6">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                        /completed/i.test(row.overall_status || row.status || '') ? 'bg-emerald-100 text-emerald-800' :
                        /in_progress/i.test(row.overall_status || row.status || '') ? 'bg-sky-100 text-sky-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {row.overall_status ?? row.status ?? '—'}
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <button
                        type="button"
                        onClick={() => setViewInspection(row)}
                        className="inline-flex items-center px-3 py-2 rounded-xl bg-violet-50 text-violet-700 text-sm font-medium hover:bg-violet-100 transition"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CreateScheduleModal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        onSuccess={fetchInspections}
      />
      <CreateInspectionModal
        isOpen={inspectionModalOpen}
        onClose={() => setInspectionModalOpen(false)}
        onSuccess={fetchInspections}
      />

      {viewInspection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/50"
            onClick={() => setViewInspection(null)}
            aria-hidden
          />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-[#1F2937]">Inspection details</h2>
              <button
                type="button"
                onClick={() => setViewInspection(null)}
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-3">
              <div>
                <span className="text-sm text-slate-500">Inspection ID</span>
                <p className="font-medium text-[#1F2937]">{viewInspection.id ?? '—'}</p>
              </div>
              <div>
                <span className="text-sm text-slate-500">Job ticket</span>
                <p className="font-medium text-[#1F2937]">
                  {viewInspection.job_ticket_id ?? viewInspection.job_ticket?.id ?? '—'}
                </p>
              </div>
              <div>
                <span className="text-sm text-slate-500">Start time</span>
                <p className="font-medium text-[#1F2937]">
                  {viewInspection.start_time
                    ? new Date(viewInspection.start_time).toLocaleString()
                    : '—'}
                </p>
              </div>
              <div>
                <span className="text-sm text-slate-500">End time</span>
                <p className="font-medium text-[#1F2937]">
                  {viewInspection.end_time
                    ? new Date(viewInspection.end_time).toLocaleString()
                    : '—'}
                </p>
              </div>
              <div>
                <span className="text-sm text-slate-500">Status</span>
                <p className="font-medium text-[#1F2937]">
                  {viewInspection.overall_status ?? viewInspection.status ?? '—'}
                </p>
              </div>
            </div>

            {canUpdateInspection && (viewInspection.overall_status || '').toLowerCase() !== 'completed' && (
              <div className="px-6 pb-4 border-t border-slate-100 pt-4 space-y-4">
                <h3 className="font-semibold text-[#1F2937] flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Update report
                </h3>
                {packageId && (
                  <>
                    <div>
                      <p className="text-sm text-slate-600 mb-2">Checklist</p>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {checklistItems.map((item) => {
                          const result = getResultForItem(item.id)
                          return (
                            <ChecklistRow
                              key={item.id}
                              item={item}
                              result={result}
                              onSave={handleSaveChecklistItem}
                              saving={checklistSaving}
                            />
                          )
                        })}
                        {checklistItems.length === 0 && (
                          <p className="text-sm text-slate-500">No checklist items for this package.</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 mb-1.5">What you did / Summary</p>
                      <textarea
                        value={reportNotes}
                        onChange={(e) => setReportNotes(e.target.value)}
                        placeholder="Add notes or summary..."
                        rows={3}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 focus:ring-2 focus:ring-[#C4B5FD] focus:border-[#A78BFA]"
                      />
                      <button
                        type="button"
                        onClick={handleSaveReportNotes}
                        disabled={reportSaving}
                        className="mt-2 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 disabled:opacity-50"
                      >
                        {reportSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save notes
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="px-6 pb-6 flex gap-2">
              {canUpdateInspection &&
                (viewInspection.overall_status || '').toLowerCase() !== 'completed' && (
                  <button
                    type="button"
                    onClick={async () => {
                      if (!viewInspection?.id) return
                      setUpdatingId(viewInspection.id)
                      try {
                        await inspectionServices.updateInspection(viewInspection.id, {
                          overall_status: 'completed',
                          end_time: new Date().toISOString(),
                        })
                        setViewInspection((prev) =>
                          prev
                            ? {
                                ...prev,
                                overall_status: 'completed',
                                end_time: new Date().toISOString(),
                              }
                            : null
                        )
                        fetchInspections()
                      } catch (err) {
                        const detail = err.response?.data?.detail ?? err.message ?? 'Update failed'
                        setError(Array.isArray(detail) ? detail.join(' ') : String(detail))
                      } finally {
                        setUpdatingId(null)
                      }
                    }}
                    disabled={updatingId === viewInspection.id}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {updatingId === viewInspection.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    Mark completed
                  </button>
                )}
              <button
                type="button"
                onClick={() => setViewInspection(null)}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Inspections
