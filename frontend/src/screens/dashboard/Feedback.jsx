import React, { useEffect, useState } from "react";
import { MessageSquare, Eye } from "lucide-react";
import axios from "axios";
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
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937]">Feedback</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Manage user feedback
          </p>
        </div>
        <button
  onClick={() => setIsModalOpen(true)}
  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#A78BFA] text-white font-medium hover:bg-[#8B5CF6] transition shadow-sm shrink-0"
>
  <MessageSquare className="w-4 h-4" /> New Feedback
</button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-[#1F2937]">Feedback list</h2>
          <p className="text-slate-500 text-sm mt-0.5">
            All submitted feedback
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-100 bg-slate-50/50">
                <th className="py-3 px-6 font-medium">Name</th>
                <th className="py-3 px-6 font-medium">Rating</th>
                <th className="py-3 px-6 font-medium">Comment</th>
                <th className="py-3 px-6 font-medium">Date</th>
                
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-slate-500">
                    Loading feedback...
                  </td>
                </tr>
              ) : feedbacks.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-slate-500">
                    No feedback found
                  </td>
                </tr>
              ) : (
                feedbacks.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50"
                  >
                    <td className="py-3 px-6 font-medium text-[#1F2937]">
                      {row.name}
                    </td>
                    <td className="py-3 px-6 text-slate-600">
                      {row.rating}
                    </td>
                    <td className="py-3 px-6 text-slate-600 max-w-xs truncate">
                      {row.comment}
                    </td>
                    <td className="py-3 px-6 text-slate-600">
                      {new Date(row.created_at).toLocaleDateString()}
                    </td>
                    {/* <td className="py-3 px-6">
                      <button className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-[#7C3AED]">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td> */}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <CreateFeedbackModal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}/>
    </div>
  );
}

export default Feedback;