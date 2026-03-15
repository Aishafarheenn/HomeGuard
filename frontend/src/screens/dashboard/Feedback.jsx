import React, { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import CreateFeedbackModal from "./CreateFeedbackModal";
import { feedbackService } from "../../services/requests/feedbackService";

function Feedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const res = await feedbackService.getFeedback();
      setFeedbacks(res); 
    } catch (error) {
      console.error("Error fetching feedbacks", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Feedback</h1>
          <p className="text-slate-500 text-sm mt-1">Manage user feedback and ratings</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 text-white font-medium hover:bg-violet-700 shadow-sm shrink-0"
        >
          <MessageSquare className="w-4 h-4" /> New feedback
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <span className="w-12 h-12 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
            </span>
            <div>
              <h2 className="font-semibold text-slate-900 text-lg">Feedback list</h2>
              <p className="text-slate-500 text-sm mt-0.5">All submitted feedback</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-500">
            <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm font-medium">Loading feedback…</p>
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-500">
            <span className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <MessageSquare className="w-10 h-10 text-slate-400" />
            </span>
            <p className="font-semibold text-slate-700">No feedback yet</p>
            <p className="text-sm mt-1 text-slate-500">Submitted feedback will appear here.</p>
          </div>
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
                    <td className="py-4 px-6 text-slate-600 text-sm max-w-md truncate">{row.comment}</td>
                    <td className="py-4 px-6 text-slate-500 text-sm">{new Date(row.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <CreateFeedbackModal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}/>
    </div>
  );
}

export default Feedback;