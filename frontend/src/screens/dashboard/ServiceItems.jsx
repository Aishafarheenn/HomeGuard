import React from 'react'
import { ClipboardList, Users, FileText, ShieldCheck, ArrowRight } from 'lucide-react'

const services = [
  {
    title: 'Inspection service',
    description: 'Schedule and manage home safety inspections.',
    icon: ClipboardList,
  },
  {
    title: 'Owner management',
    description: 'Manage property owners and their details.',
    icon: Users,
  },
  {
    title: 'Reports & documents',
    description: 'Access inspection reports and evidence files.',
    icon: FileText,
  },
  {
    title: 'Security package',
    description: 'Complete home protection and monitoring.',
    icon: ShieldCheck,
  },
]

function ServiceItems() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#1F2937]">Services</h1>
        <p className="text-slate-500 text-sm mt-0.5">HomeGuard inspection and management services</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {services.map((item) => {
          const Icon = item.icon
          return (
            <div
              key={item.title}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-[#DDD6FE] transition"
            >
              <div className="w-12 h-12 rounded-xl bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center mb-4">
                <Icon className="w-6 h-6" />
              </div>
              <h2 className="font-semibold text-[#1F2937] mb-2">{item.title}</h2>
              <p className="text-slate-500 text-sm mb-4">{item.description}</p>
              <button className="inline-flex items-center gap-2 text-sm font-medium text-[#7C3AED] hover:underline">
                View <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ServiceItems
