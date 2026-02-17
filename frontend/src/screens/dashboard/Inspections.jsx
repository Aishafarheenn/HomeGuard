import React from 'react'
import { ClipboardCheck, Plus, Eye, Calendar } from 'lucide-react'

const mockInspections = [
  { id: 1, property: 'Villa — Kochi', owner: 'Rahul M.', inspector: 'Arjun K.', date: '2026-02-20', status: 'Scheduled' },
  { id: 2, property: 'Apartment — Calicut', owner: 'Nisha K.', inspector: 'Akhil M.', date: '2026-02-15', status: 'Completed' },
  { id: 3, property: 'House — Trivandrum', owner: 'Arun P.', inspector: 'Arjun K.', date: '2026-02-22', status: 'Pending' },
]

function Inspections() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937]">Inspections</h1>
          <p className="text-slate-500 text-sm mt-0.5">Schedule and manage property inspections</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#A78BFA] text-white font-medium hover:bg-[#9333EA] transition shadow-sm shrink-0">
          <Calendar className="w-4 h-4" /> Schedule inspection
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-[#1F2937]">Inspection list</h2>
            <p className="text-slate-500 text-sm mt-0.5">All scheduled and completed inspections</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-100 bg-slate-50/50">
                <th className="py-3 px-6 font-medium">Property</th>
                <th className="py-3 px-6 font-medium">Owner</th>
                <th className="py-3 px-6 font-medium">Inspector</th>
                <th className="py-3 px-6 font-medium">Date</th>
                <th className="py-3 px-6 font-medium">Status</th>
                <th className="py-3 px-6 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockInspections.map((row) => (
                <tr key={row.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                  <td className="py-3 px-6 font-medium text-[#1F2937]">{row.property}</td>
                  <td className="py-3 px-6 text-slate-600">{row.owner}</td>
                  <td className="py-3 px-6 text-slate-600">{row.inspector}</td>
                  <td className="py-3 px-6 text-slate-600">{row.date}</td>
                  <td className="py-3 px-6">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      row.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                      row.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="py-3 px-6">
                    <button className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-[#7C3AED]">View</button>
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

export default Inspections
