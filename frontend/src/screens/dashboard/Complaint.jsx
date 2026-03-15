import React, { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import CreateComplaintModal from "./CreateCompaintModal";
import { newComplaint } from "../../services/requests/newComplaint";

function Complaint() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); 

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
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 text-white font-medium hover:bg-violet-700 shadow-sm shrink-0"
        >
          <MessageSquare className="w-4 h-4" /> New complaint
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <span className="w-12 h-12 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
            </span>
            <div>
              <h2 className="font-semibold text-slate-900 text-lg">Complaint list</h2>
              <p className="text-slate-500 text-sm mt-0.5">All submitted complaints</p>
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
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {complaints.map((row) => (
                  <tr key={row.id} className="hover:bg-violet-50/30 transition-colors">
                    <td className="py-4 px-6 font-medium text-slate-900">{row.name}</td>
                    <td className="py-4 px-6 text-slate-600 text-sm">{row.email}</td>
                    <td className="py-4 px-6 text-slate-600 text-sm max-w-xs truncate">{row.message}</td>
                    <td className="py-4 px-6 text-slate-500 text-sm">{new Date(row.created_at).toLocaleDateString()}</td>
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