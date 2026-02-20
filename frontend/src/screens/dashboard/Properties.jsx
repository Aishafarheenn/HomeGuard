import React ,{useState}from 'react'
import { Plus, Eye, Edit, Trash2, ClipboardList, FileText } from 'lucide-react'
import CreateAddPropertyModal from './CreateAddPropertyModal'

const features = [
  // { title: 'Add property', description: 'Register a new property under an owner.', icon: Plus },
  { title: 'View properties', description: 'See all registered properties.', icon: Eye },
  { title: 'Update property', description: 'Modify property details and information.', icon: Edit },
  { title: 'Delete property', description: 'Remove a property from the system.', icon: Trash2 },
  { title: 'Property inspections', description: 'View inspections scheduled for properties.', icon: ClipboardList },
  { title: 'Property reports', description: 'Access inspection reports and evidence.', icon: FileText },
]

const mockProperties = [
  { id: 1, address: 'Villa — Kochi', owner: 'Rahul M.', type: 'Villa', status: 'Active' },
  { id: 2, address: 'Apartment — Calicut', owner: 'Nisha K.', type: 'Apartment', status: 'Active' },
  { id: 3, address: 'House — Trivandrum', owner: 'Arun P.', type: 'House', status: 'Pending' },
]

function Properties() {
   const [modalOpen, setModalOpen] = useState(false)
   
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937]">Properties</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage properties and view inspection schedules</p>
        </div>
       <button
                 type="button"
                 onClick={() => setModalOpen(true)}
                 className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#A78BFA] text-white font-medium hover:bg-[#9333EA] transition shadow-sm shrink-0"
               >
                 <Plus className="w-4 h-4" /> Add property
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
          <h2 className="font-semibold text-[#1F2937]">All properties</h2>
          <p className="text-slate-500 text-sm mt-0.5">List of registered properties</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-100 bg-slate-50/50">
                <th className="py-3 px-6 font-medium">Address</th>
                <th className="py-3 px-6 font-medium">Owner</th>
                <th className="py-3 px-6 font-medium">Type</th>
                <th className="py-3 px-6 font-medium">Status</th>
                <th className="py-3 px-6 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockProperties.map((row) => (
                <tr key={row.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                  <td className="py-3 px-6 font-medium text-[#1F2937]">{row.address}</td>
                  <td className="py-3 px-6 text-slate-600">{row.owner}</td>
                  <td className="py-3 px-6 text-slate-600">{row.type}</td>
                  <td className="py-3 px-6">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${row.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
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
      <CreateAddPropertyModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  )
}

export default Properties
