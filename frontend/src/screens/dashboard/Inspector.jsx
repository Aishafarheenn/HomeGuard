import React from 'react'
import { UserCog, Plus, Mail, Phone } from 'lucide-react'

const mockInspectors = [
  { id: 1, name: 'Arjun K.', email: 'arjun@example.com', phone: '9876543210', experience: '5 years', assigned: 4, status: 'Active' },
  { id: 2, name: 'Akhil M.', email: 'akhil@example.com', phone: '9123456780', experience: '3 years', assigned: 2, status: 'Inactive' },
  { id: 3, name: 'Priya S.', email: 'priya@example.com', phone: '9988776655', experience: '4 years', assigned: 3, status: 'Active' },
]

function Inspector() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937]">Inspectors</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage inspectors and their assignments</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#A78BFA] text-white font-medium hover:bg-[#9333EA] transition shadow-sm shrink-0">
          <Plus className="w-4 h-4" /> Add inspector
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-[#1F2937]">Inspector list</h2>
          <p className="text-slate-500 text-sm mt-0.5">All registered inspectors</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-100 bg-slate-50/50">
                <th className="py-3 px-6 font-medium">Name</th>
                <th className="py-3 px-6 font-medium">Email</th>
                <th className="py-3 px-6 font-medium">Phone</th>
                <th className="py-3 px-6 font-medium">Experience</th>
                <th className="py-3 px-6 font-medium">Assigned</th>
                <th className="py-3 px-6 font-medium">Status</th>
                <th className="py-3 px-6 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockInspectors.map((row) => (
                <tr key={row.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                  <td className="py-3 px-6 font-medium text-[#1F2937]">{row.name}</td>
                  <td className="py-3 px-6 text-slate-600">{row.email}</td>
                  <td className="py-3 px-6 text-slate-600">{row.phone}</td>
                  <td className="py-3 px-6 text-slate-600">{row.experience}</td>
                  <td className="py-3 px-6 text-slate-600">{row.assigned} properties</td>
                  <td className="py-3 px-6">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      row.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="py-3 px-6">
                    <div className="flex gap-2">
                      <button className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-[#7C3AED]">View</button>
                      <button className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-[#7C3AED]">Edit</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Inspector
