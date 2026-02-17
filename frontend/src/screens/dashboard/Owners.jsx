import React from 'react'
import { Users, PlusCircle, Eye, Edit, Trash2, ClipboardList, FileText } from 'lucide-react'

const features = [
  { title: 'Add owner', description: 'Register a new property owner.', icon: PlusCircle },
  { title: 'View owners', description: 'See all registered property owners.', icon: Users },
  { title: 'Update owner', description: 'Edit existing owner details.', icon: Edit },
  { title: 'Delete owner', description: 'Remove an owner from the system.', icon: Trash2 },
  { title: 'Owner inspections', description: 'View inspections assigned to owners.', icon: ClipboardList },
  { title: 'Owner reports', description: 'Access inspection reports of owners.', icon: FileText },
]

const mockOwners = [
  { id: 1, name: 'Rahul M.', email: 'rahul@example.com', phone: '+91 98765 43210', country: 'India' },
  { id: 2, name: 'Nisha K.', email: 'nisha@example.com', phone: '+91 91234 56780', country: 'India' },
  { id: 3, name: 'Arun P.', email: 'arun@example.com', phone: '+91 99887 76655', country: 'India' },
]

function Owners() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937]">Owners</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage property owners and their details</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#A78BFA] text-white font-medium hover:bg-[#9333EA] transition shadow-sm shrink-0">
          <PlusCircle className="w-4 h-4" /> Add owner
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((item) => {
          const Icon = item.icon
          return (
            <div
              key={item.title}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-[#DDD6FE] transition"
            >
              <div className="w-11 h-11 rounded-xl bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center mb-3">
                <Icon className="w-5 h-5" />
              </div>
              <h2 className="font-semibold text-[#1F2937] mb-1">{item.title}</h2>
              <p className="text-slate-500 text-sm mb-4">{item.description}</p>
              <button className="w-full py-2 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 hover:border-[#C4B5FD] transition">
                Open
              </button>
            </div>
          )
        })}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-[#1F2937]">All owners</h2>
          <p className="text-slate-500 text-sm mt-0.5">Registered property owners</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-100 bg-slate-50/50">
                <th className="py-3 px-6 font-medium">Name</th>
                <th className="py-3 px-6 font-medium">Email</th>
                <th className="py-3 px-6 font-medium">Phone</th>
                <th className="py-3 px-6 font-medium">Country</th>
                <th className="py-3 px-6 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockOwners.map((row) => (
                <tr key={row.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                  <td className="py-3 px-6 font-medium text-[#1F2937]">{row.name}</td>
                  <td className="py-3 px-6 text-slate-600">{row.email}</td>
                  <td className="py-3 px-6 text-slate-600">{row.phone}</td>
                  <td className="py-3 px-6 text-slate-600">{row.country}</td>
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

export default Owners
