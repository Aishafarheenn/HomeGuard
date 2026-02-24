import React, { useEffect, useState } from "react";
import { MessageSquare, Eye } from "lucide-react";
import axios from "axios";

function Complaint() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await axios.get("");
      setComplaints(res.data);
    } catch (error) {
      console.error("Error fetching complaints", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937]">Complaints</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Manage user complaints and issues
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition shadow-sm shrink-0">
          <MessageSquare className="w-4 h-4" /> New Complaint
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-[#1F2937]">Complaint list</h2>
          <p className="text-slate-500 text-sm mt-0.5">
            All submitted complaints
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-100 bg-slate-50/50">
                <th className="py-3 px-6 font-medium">Name</th>
                <th className="py-3 px-6 font-medium">Email</th>
                <th className="py-3 px-6 font-medium">Message</th>
                <th className="py-3 px-6 font-medium">Date</th>
                <th className="py-3 px-6 font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-slate-500">
                    Loading complaints...
                  </td>
                </tr>
              ) : complaints.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-slate-500">
                    No complaints found
                  </td>
                </tr>
              ) : (
                complaints.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50"
                  >
                    <td className="py-3 px-6 font-medium text-[#1F2937]">
                      {row.name}
                    </td>
                    <td className="py-3 px-6 text-slate-600">
                      {row.email}
                    </td>
                    <td className="py-3 px-6 text-slate-600 max-w-xs truncate">
                      {row.message}
                    </td>
                    <td className="py-3 px-6 text-slate-600">
                      {new Date(row.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-6">
                      <button className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-[#7C3AED]">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Complaint;