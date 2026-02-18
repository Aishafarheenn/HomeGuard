import React, { useState } from 'react'
import { ClipboardList, Users, FileText, ShieldCheck, Plus, ArrowRight } from 'lucide-react'
import CreateServiceitemModal from './CreateServiceitemModal'

const staticServices = [
  { title: 'Inspection service', description: 'Schedule and manage home safety inspections.', icon: ClipboardList },
  { title: 'Owner management', description: 'Manage property owners and their details.', icon: Users },
  { title: 'Reports & documents', description: 'Access inspection reports and evidence files.', icon: FileText },
  { title: 'Security package', description: 'Complete home protection and monitoring.', icon: ShieldCheck },
]

function ServiceItems() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937]">Services</h1>
          <p className="text-slate-500 text-sm mt-0.5">HomeGuard inspection and management services</p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#A78BFA] text-white font-medium hover:bg-[#9333EA] transition shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" /> Create package
        </button>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-[#1F2937] mb-4">Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {staticServices.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.title}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-[#DDD6FE] transition"
              >
                <div className="w-12 h-12 rounded-xl bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-[#1F2937] mb-2">{item.title}</h3>
                <p className="text-slate-500 text-sm mb-4">{item.description}</p>
                <span className="inline-flex items-center gap-2 text-sm font-medium text-[#7C3AED]">
                  View <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <CreateServiceitemModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  )
}

export default ServiceItems
