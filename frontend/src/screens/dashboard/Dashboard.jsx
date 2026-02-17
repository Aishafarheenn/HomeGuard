import React from 'react'
import { Link } from 'react-router-dom'
import {
  Home,
  ClipboardCheck,
  Users,
  Ticket,
  TrendingUp,
  ArrowRight,
  Calendar,
} from 'lucide-react'

const stats = [
  { label: 'Total properties', value: '24', icon: Home, color: 'bg-[#EDE9FE] text-[#7C3AED]' },
  { label: 'Inspections', value: '18', icon: ClipboardCheck, color: 'bg-[#DBEAFE] text-[#2563EB]' },
  { label: 'Registered owners', value: '52', icon: Users, color: 'bg-[#D1FAE5] text-[#059669]' },
  { label: 'Job tickets', value: '89', icon: Ticket, color: 'bg-[#FCE7F3] text-[#BE185D]' },
]

const recentTickets = [
  { id: 1, property: 'Villa — Kochi', issue: 'Electrical wiring check', priority: 'High', status: 'Open', date: '20 Feb 2026' },
  { id: 2, property: 'Apartment — Calicut', issue: 'Water leakage inspection', priority: 'Medium', status: 'In progress', date: '18 Feb 2026' },
  { id: 3, property: 'House — Trivandrum', issue: 'Pre-purchase inspection', priority: 'High', status: 'Scheduled', date: '22 Feb 2026' },
]

const quickActions = [
  { label: 'Schedule inspection', to: '/dashboard/inspections', icon: Calendar },
  { label: 'Add property', to: '/dashboard/properties', icon: Home },
  { label: 'Create job ticket', to: '/dashboard/jobtickets', icon: Ticket },
]

function Dashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#1F2937]">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-0.5">Overview of your inspection and property management</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((item) => {
          const Icon = item.icon
          return (
            <div
              key={item.label}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition"
            >
              <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-slate-500 text-sm font-medium">{item.label}</p>
              <p className="text-2xl font-bold text-[#1F2937] mt-1">{item.value}</p>
            </div>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent job tickets */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-[#1F2937]">Recent job tickets</h2>
            <Link
              to="/dashboard/jobtickets"
              className="text-sm font-medium text-[#7C3AED] hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-100">
                  <th className="py-3 px-6 font-medium">Property</th>
                  <th className="py-3 px-6 font-medium">Issue</th>
                  <th className="py-3 px-6 font-medium">Priority</th>
                  <th className="py-3 px-6 font-medium">Status</th>
                  <th className="py-3 px-6 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentTickets.map((t) => (
                  <tr key={t.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                    <td className="py-3 px-6 text-[#1F2937]">{t.property}</td>
                    <td className="py-3 px-6 text-slate-600">{t.issue}</td>
                    <td className="py-3 px-6">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        t.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="py-3 px-6">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-slate-500">{t.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-semibold text-[#1F2937] mb-4">Quick actions</h2>
          <div className="space-y-2">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.label}
                  to={action.to}
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-[#F5F3FF] hover:border-[#DDD6FE] transition"
                >
                  <span className="w-9 h-9 rounded-lg bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className="font-medium text-slate-700">{action.label}</span>
                  <ArrowRight className="w-4 h-4 text-slate-400 ml-auto" />
                </Link>
              )
            })}
          </div>
          <div className="mt-6 p-4 rounded-xl bg-[#F5F3FF] border border-[#EDE9FE]">
            <div className="flex items-center gap-2 text-[#7C3AED] mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="font-medium text-sm">This week</span>
            </div>
            <p className="text-2xl font-bold text-[#1F2937]">12</p>
            <p className="text-slate-500 text-xs">inspections completed</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
