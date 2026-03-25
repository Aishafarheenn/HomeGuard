import React, { useEffect, useState } from "react";
import { MessageSquare, Loader2, Send } from "lucide-react";
import CreateComplaintModal from "./CreateCompaintModal";
import { newComplaint } from "../../services/requests/newComplaint";
import { useAuth } from "../../context/AuthContext";

function Complaint() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const isOwner = user?.role === "owner";
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [replyDraft, setReplyDraft] = useState({});
  const [replyingId, setReplyingId] = useState(null);

   useEffect(() => {
    fetchComplaints();
  }, [])


  const fetchComplaints = async () => {
    setLoading(true);
    try{
    const response = await newComplaint.getComplaint()
    const complaintData = response?? []
      setComplaints(complaintData)
      console.log(complaintData)
    } catch (err) {
      console.error("Error fetching complaints", err.response?.data ?? err.message)
    } finally {
      setLoading(false);
    }
  }

 

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Complaints</h1>
          <p className="text-slate-500 text-sm mt-1">Manage user complaints and issues</p>
        </div>
        {isOwner && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 text-white font-medium hover:bg-violet-700 shadow-sm shrink-0"
          >
            <MessageSquare className="w-4 h-4" /> New complaint
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <span className="w-12 h-12 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
            </span>
            <div>
              <h2 className="font-semibold text-slate-900 text-lg">Complaint list</h2>
              <p className="text-slate-500 text-sm mt-0.5">
                {isAdmin ? "Review and respond to owner complaints" : "Your submitted complaints"}
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-500">
            <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm font-medium">Loading complaints…</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-500">
            <span className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <MessageSquare className="w-10 h-10 text-slate-400" />
            </span>
            <p className="font-semibold text-slate-700">No complaints yet</p>
            <p className="text-sm mt-1 text-slate-500">Submitted complaints will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200 bg-slate-50">
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Email</th>
                  <th className="py-4 px-6">Message</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6 min-w-[220px]">Admin response</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {complaints.map((row) => (
                  <tr key={row.id} className="hover:bg-violet-50/30 transition-colors">
                    <td className="py-4 px-6 font-medium text-slate-900">{row.name}</td>
                    <td className="py-4 px-6 text-slate-600 text-sm">{row.email}</td>
                    <td className="py-4 px-6 text-slate-600 text-sm max-w-xs truncate">{row.message}</td>
                    <td className="py-4 px-6 text-slate-500 text-sm">{new Date(row.created_at).toLocaleDateString()}</td>
                    <td className="py-4 px-6">
                      {row.admin_response ? (
                        <div className="text-sm">
                          <p className="text-slate-700 whitespace-pre-wrap">{row.admin_response}</p>
                          {row.responded_at && (
                            <p className="text-xs text-slate-400 mt-1">
                              {new Date(row.responded_at).toLocaleString()}
                            </p>
                          )}
                        </div>
                      ) : isAdmin ? (
                        <div className="flex flex-col gap-2">
                          <textarea
                            value={replyDraft[row.id] ?? ""}
                            onChange={(e) =>
                              setReplyDraft((prev) => ({ ...prev, [row.id]: e.target.value }))
                            }
                            rows={2}
                            placeholder="Write response..."
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                          />
                          <button
                            type="button"
                            onClick={async () => {
                              const text = (replyDraft[row.id] || "").trim();
                              if (!text) return;
                              setReplyingId(row.id);
                              try {
                                await newComplaint.respondComplaint(row.id, text);
                                setReplyDraft((prev) => ({ ...prev, [row.id]: "" }));
                                await fetchComplaints();
                              } catch (err) {
                                console.error("Error responding complaint", err.response?.data ?? err.message);
                              } finally {
                                setReplyingId(null);
                              }
                            }}
                            disabled={replyingId === row.id || !(replyDraft[row.id] || "").trim()}
                            className="inline-flex items-center gap-1.5 self-start px-3 py-2 rounded-lg bg-violet-600 text-white text-xs font-medium hover:bg-violet-700 disabled:opacity-50"
                          >
                            {replyingId === row.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Send className="w-4 h-4" />
                            )}
                            Send response
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-sm">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <CreateComplaintModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchComplaints}
      />
    </div>
  );
}

export default Complaint;