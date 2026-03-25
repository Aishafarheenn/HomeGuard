import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { MessageSquare, Loader2, Star } from 'lucide-react'
import CreateFeedbackModal from './CreateFeedbackModal'
import { feedbackService } from '../../services/requests/feedbackService'
import { useAuth } from '../../context/AuthContext'

function Feedback() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const isOwner = user?.role === 'owner'
  const isInspector = user?.role === 'inspector'

  const [feedbacks, setFeedbacks] = useState([])
  const [inspectionReviews, setInspectionReviews] = useState([])
  const [loading, setLoading] = useState(false)
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchFeedbacks = useCallback(async () => {
    if (!isAdmin) return
    try {
      setLoading(true)
      const res = await feedbackService.getFeedback()
      setFeedbacks(Array.isArray(res) ? res : [])
    } catch (error) {
      console.error('Error fetching feedbacks', error)
      setFeedbacks([])
    } finally {
      setLoading(false)
    }
  }, [isAdmin])

  const fetchInspectionReviews = useCallback(async () => {
    if (!isAdmin && !isOwner && !isInspector) return
    try {
      setReviewsLoading(true)
      const res = await feedbackService.getInspectionReviews()
      setInspectionReviews(Array.isArray(res) ? res : [])
    } catch (error) {
      console.error('Error fetching inspection reviews', error)
      setInspectionReviews([])
    } finally {
      setReviewsLoading(false)
    }
  }, [isAdmin, isOwner, isInspector])

  const inspectorAvgRating = useMemo(() => {
    if (!isInspector || inspectionReviews.length === 0) return null
    const sum = inspectionReviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0)
    return Math.round((sum / inspectionReviews.length) * 10) / 10
  }, [isInspector, inspectionReviews])

  useEffect(() => {
    fetchFeedbacks()
  }, [fetchFeedbacks])

  useEffect(() => {
    fetchInspectionReviews()
  }, [fetchInspectionReviews])

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Feedback</h1>
          <p className="text-slate-500 text-sm mt-1">
            {isAdmin
              ? 'View general feedback and inspection reviews submitted by owners'
              : 'Your inspection reviews and general feedback'}
          </p>
        </div>
        {!isAdmin && (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 text-white font-medium hover:bg-violet-700 shadow-sm shrink-0"
          >
            <MessageSquare className="w-4 h-4" /> New feedback
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <span className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Star className="w-6 h-6" />
            </span>
            <div>
              <h2 className="font-semibold text-slate-900 text-lg">Inspection reviews</h2>
              <p className="text-slate-500 text-sm mt-0.5">
                {isOwner
                  ? 'Your ratings and comments after completed inspections'
                  : isInspector
                    ? 'Owner ratings and comments for jobs you completed'
                    : 'Owner ratings after completed jobs'}
              </p>
            </div>
          </div>
        </div>

        {isInspector && inspectorAvgRating != null && (
          <div className="px-6 py-3 bg-amber-50/80 border-b border-amber-100 flex flex-wrap items-center gap-2 text-sm">
            <span className="font-semibold text-amber-900">Your average rating</span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-bold bg-amber-100 text-amber-900">
              {inspectorAvgRating} ★
            </span>
            <span className="text-amber-800/80">
              ({inspectionReviews.length} review{inspectionReviews.length === 1 ? '' : 's'})
            </span>
          </div>
        )}

        {reviewsLoading ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-500">
            <Loader2 className="w-10 h-10 animate-spin text-violet-500 mb-3" />
            <p className="text-sm font-medium">Loading reviews…</p>
          </div>
        ) : inspectionReviews.length === 0 ? (
          <div className="py-12 px-6 text-center text-slate-500 text-sm">
            {isInspector
              ? 'No owner reviews yet. Reviews appear here after owners submit a rating for a completed inspection.'
              : isOwner
                ? 'No inspection reviews yet. Submit a rating from My Jobs after an inspection is completed.'
                : 'No inspection reviews yet.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200 bg-slate-50">
                  <th className="py-4 px-6">Property</th>
                  <th className="py-4 px-6">Owner</th>
                  {!isInspector && <th className="py-4 px-6">Inspector</th>}
                  <th className="py-4 px-6">Rating</th>
                  <th className="py-4 px-6">Comment</th>
                  <th className="py-4 px-6">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inspectionReviews.map((row) => (
                  <tr key={row.id} className="hover:bg-violet-50/30 align-top">
                    <td className="py-4 px-6 text-sm text-slate-600">{row.property_address || '—'}</td>
                    <td className="py-4 px-6 text-sm font-medium text-slate-900">{row.owner_name || '—'}</td>
                    {!isInspector && (
                      <td className="py-4 px-6 text-sm text-slate-600">{row.inspector_name || '—'}</td>
                    )}
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                        {row.rating} ★
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-600 text-sm max-w-xs">{row.comment}</td>
                    <td className="py-4 px-6 text-slate-500 text-sm whitespace-nowrap">
                      {row.created_at ? new Date(row.created_at).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isAdmin && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <span className="w-12 h-12 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center">
                <MessageSquare className="w-6 h-6" />
              </span>
              <div>
                <h2 className="font-semibold text-slate-900 text-lg">General feedback</h2>
                <p className="text-slate-500 text-sm mt-0.5">All submitted app feedback</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-slate-500">
              <Loader2 className="w-10 h-10 animate-spin text-violet-500 mb-3" />
              <p className="text-sm font-medium">Loading feedback…</p>
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="py-12 px-6 text-center text-slate-500 text-sm">No general feedback yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200 bg-slate-50">
                    <th className="py-4 px-6">Name</th>
                    <th className="py-4 px-6">Rating</th>
                    <th className="py-4 px-6">Comment</th>
                    <th className="py-4 px-6">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {feedbacks.map((row) => (
                    <tr key={row.id} className="hover:bg-violet-50/30 transition-colors">
                      <td className="py-4 px-6 font-medium text-slate-900">{row.name}</td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                          {row.rating} ★
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-600 text-sm max-w-md">{row.comment}</td>
                      <td className="py-4 px-6 text-slate-500 text-sm">
                        {new Date(row.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {isOwner && (
        <CreateFeedbackModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => fetchFeedbacks()}
        />
      )}
    </div>
  )
}

export default Feedback
