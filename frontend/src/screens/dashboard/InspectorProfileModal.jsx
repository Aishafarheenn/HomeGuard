import React, { useEffect, useState } from 'react'
import { X, Loader2, Briefcase, Star, User } from 'lucide-react'
import { inspectorServices } from '../../services/requests/inspectorServices'

function InspectorProfileModal({ inspectorId, inspectorName, isOpen, onClose }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)

  useEffect(() => {
    if (!isOpen || !inspectorId) return
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      setData(null)
      try {
        const res = await inspectorServices.getInspectorProfile(inspectorId)
        if (!cancelled) setData(res)
      } catch (err) {
        if (!cancelled) {
          const detail = err.response?.data?.detail ?? err.message ?? 'Failed to load profile'
          setError(Array.isArray(detail) ? detail.join(' ') : String(detail))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [isOpen, inspectorId])

  if (!isOpen) return null

  const ins = data?.inspector
  const job = data?.job_summary
  const rating = data?.rating_summary
  const reviews = Array.isArray(data?.reviews) ? data.reviews : []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col bg-white rounded-2xl shadow-xl border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-11 h-11 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center shrink-0">
              <User className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-slate-900 truncate">
                {ins?.full_name || inspectorName || 'Inspector profile'}
              </h2>
              <p className="text-sm text-slate-500 truncate">Details, jobs, and owner ratings</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">
          {loading && (
            <div className="py-16 flex flex-col items-center justify-center text-slate-500">
              <Loader2 className="w-10 h-10 animate-spin text-violet-500 mb-3" />
              <p className="text-sm font-medium">Loading profile…</p>
            </div>
          )}

          {error && !loading && (
            <div className="rounded-xl bg-red-50 border border-red-100 text-red-700 px-4 py-3 text-sm">{error}</div>
          )}

          {!loading && !error && ins && (
            <>
              <section className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-3">Inspector details</h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-slate-500">Name</dt>
                    <dd className="font-medium text-slate-900">{ins.full_name}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Email</dt>
                    <dd className="font-medium text-slate-900 break-all">{ins.email}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Phone</dt>
                    <dd className="font-medium text-slate-900">{ins.phone || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Status</dt>
                    <dd>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                          ins.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ins.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {ins.status}
                      </span>
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-slate-500">Registered</dt>
                    <dd className="text-slate-800">
                      {ins.created_at ? new Date(ins.created_at).toLocaleString() : '—'}
                    </dd>
                  </div>
                </dl>
              </section>

              <section className="rounded-xl border border-slate-200 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Briefcase className="w-5 h-5 text-violet-600" />
                  <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Job summary</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
                    <p className="text-xs text-slate-500">Total jobs</p>
                    <p className="text-lg font-semibold text-slate-900">{job?.total_jobs ?? 0}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
                    <p className="text-xs text-slate-500">Completed inspections</p>
                    <p className="text-lg font-semibold text-slate-900">{job?.completed_inspections ?? 0}</p>
                  </div>
                </div>
                {job?.by_status && Object.keys(job.by_status).length > 0 ? (
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-2">Jobs by ticket status</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(job.by_status).map(([st, n]) => (
                        <span
                          key={st}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 capitalize"
                        >
                          {st}: <strong>{n}</strong>
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No job tickets assigned yet.</p>
                )}
              </section>

              <section className="rounded-xl border border-slate-200 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-amber-500" />
                  <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Ratings & feedback</h3>
                </div>
                <div className="flex flex-wrap items-baseline gap-4 mb-4">
                  <div>
                    <p className="text-xs text-slate-500">Average rating</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {rating?.review_count > 0 && rating?.average_rating != null
                        ? `${rating.average_rating} ★`
                        : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Total reviews</p>
                    <p className="text-lg font-semibold text-slate-900">{rating?.review_count ?? 0}</p>
                  </div>
                </div>

                {reviews.length === 0 ? (
                  <p className="text-sm text-slate-500">No owner reviews yet.</p>
                ) : (
                  <ul className="space-y-3">
                    {reviews.map((r, idx) => (
                      <li
                        key={`${r.created_at}-${idx}`}
                        className="rounded-lg border border-slate-100 bg-slate-50/50 px-4 py-3 text-sm"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                          <span className="font-medium text-slate-900">{r.property_address || 'Property'}</span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900">
                            {r.rating} ★
                          </span>
                        </div>
                        <p className="text-slate-600 text-xs mb-1">Owner: {r.owner_name || '—'}</p>
                        <p className="text-slate-700">{r.comment}</p>
                        <p className="text-slate-400 text-xs mt-2">
                          {r.created_at ? new Date(r.created_at).toLocaleString() : ''}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default InspectorProfileModal
