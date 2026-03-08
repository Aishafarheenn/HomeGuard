import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Home,
  ClipboardCheck,
  Users,
  Ticket,
  TrendingUp,
  ArrowRight,
  Calendar,
  ClipboardList,
  Clock,
  CheckCircle,
  BellRing,
  MessageSquare,
} from 'lucide-react'

import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import { endpoint } from '../../services/endpoints'
import { inspectionServices } from '../../services/requests/inspectionServices'
import { createJobticketApi } from '../../services/requests/CreateJobticket'

const initialStats = [
  { key: 'properties', label: 'Total properties', value: 0, icon: Home, color: 'bg-violet-100 text-violet-600' },
  { key: 'inspections', label: 'Inspections', value: 0, icon: ClipboardCheck, color: 'bg-sky-100 text-sky-600' },
  { key: 'owners', label: 'Registered owners', value: 0, icon: Users, color: 'bg-emerald-100 text-emerald-600' },
  { key: 'tickets', label: 'Job tickets', value: 0, icon: Ticket, color: 'bg-amber-100 text-amber-600' },
]

const ownerStatsKeys = [
  { key: 'properties', label: 'My properties', value: 0, icon: Home, color: 'bg-violet-100 text-violet-600' },
  { key: 'jobs', label: 'My jobs', value: 0, icon: ClipboardList, color: 'bg-sky-100 text-sky-600' },
  { key: 'pending', label: 'Pending assignment', value: 0, icon: Clock, color: 'bg-amber-100 text-amber-600' },
  { key: 'in_progress', label: 'In progress', value: 0, icon: Ticket, color: 'bg-slate-200 text-slate-700' },
  { key: 'completed', label: 'Completed', value: 0, icon: CheckCircle, color: 'bg-emerald-100 text-emerald-600' },
]

const quickActions = [
  { label: 'Schedule inspection', to: '/dashboard/inspections', icon: Calendar },
  { label: 'Add property', to: '/dashboard/properties', icon: Home },
  { label: 'Create job ticket', to: '/dashboard/jobtickets', icon: Ticket },
]

const ownerQuickActions = [
  { label: 'Schedule inspection', to: '/dashboard/inspections', icon: Calendar },
  { label: 'Add property', to: '/dashboard/properties', icon: Home },
  { label: 'My Jobs', to: '/dashboard/my-jobs', icon: ClipboardList },
]

const inspectorStatsKeys = [
  { key: 'tickets', label: 'My job tickets', value: 0, icon: Ticket, color: 'bg-violet-100 text-violet-600' },
  { key: 'in_progress', label: 'In progress', value: 0, icon: ClipboardCheck, color: 'bg-sky-100 text-sky-600' },
  { key: 'completed', label: 'Completed', value: 0, icon: CheckCircle, color: 'bg-emerald-100 text-emerald-600' },
]

const inspectorQuickActions = [
  { label: 'Job tickets', to: '/dashboard/jobtickets', icon: Ticket },
  { label: 'Notifications', to: '/dashboard/notifications', icon: BellRing },
  { label: 'Feedback', to: '/dashboard/feedback', icon: MessageSquare },
]

function getJobStage(row) {
  const completed = (row.inspection_status || '').toLowerCase() === 'completed' || !!row.inspection_completed_at
  if (completed) return 'Completed'
  const hasInspector = !!row.job_ticket_id && !!row.inspector_name
  if (!hasInspector) return 'Pending'
  return 'In progress'
}

function getLastUpdate(row) {
  const dates = [row.created_at, row.assigned_at, row.inspection_completed_at].filter(Boolean).map((d) => new Date(d))
  if (dates.length === 0) return null
  return new Date(Math.max(...dates.map((d) => d.getTime())))
}

function Dashboard() {
  const { user } = useAuth()
  const isOwner = user?.role === 'owner'
  const isInspector = user?.role === 'inspector'
  const [stats, setStats] = useState(initialStats)
  const [ownerStats, setOwnerStats] = useState(ownerStatsKeys)
  const [inspectorStats, setInspectorStats] = useState(inspectorStatsKeys)
  const [recentTickets, setRecentTickets] = useState([])
  const [recentJobUpdates, setRecentJobUpdates] = useState([])
  const [recentInspectorTickets, setRecentInspectorTickets] = useState([])

  useEffect(() => {
    const loadStats = async () => {
      if (isInspector) {
        try {
          const ticketsRes = await createJobticketApi.getJobtickets().catch(() => [])
          const tickets = Array.isArray(ticketsRes) ? ticketsRes : []
          const inProgress = tickets.filter((t) => (t.status || '').toLowerCase() === 'in_progress').length
          const completed = tickets.filter((t) => (t.status || '').toLowerCase() === 'completed').length
          setInspectorStats([
            { ...inspectorStatsKeys[0], value: tickets.length },
            { ...inspectorStatsKeys[1], value: inProgress },
            { ...inspectorStatsKeys[2], value: completed },
          ])
          const recent = tickets.slice(0, 5).map((t) => ({
            id: t.id,
            property: t.schedule?.property?.address || '—',
            status: (t.status || '').toLowerCase(),
            date: t.assigned_at ? new Date(t.assigned_at).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '—',
          }))
          setRecentInspectorTickets(recent)
        } catch (err) {
          console.error(err)
        }
        return
      }
      if (isOwner) {
        try {
          const [propertiesRes, myJobsRes] = await Promise.all([
            api.get(endpoint.property.list),
            inspectionServices.getMyJobs().catch(() => []),
          ])
          const properties = Array.isArray(propertiesRes.data) ? propertiesRes.data : []
          const jobs = Array.isArray(myJobsRes) ? myJobsRes : []
          const pending = jobs.filter((r) => !r.job_ticket_id || !r.inspector_name).length
          const completed = jobs.filter(
            (r) => (r.inspection_status || '').toLowerCase() === 'completed' || !!r.inspection_completed_at
          ).length
          const inProgress = jobs.length - pending - completed
          setOwnerStats([
            { ...ownerStatsKeys[0], value: properties.length },
            { ...ownerStatsKeys[1], value: jobs.length },
            { ...ownerStatsKeys[2], value: pending },
            { ...ownerStatsKeys[3], value: inProgress },
            { ...ownerStatsKeys[4], value: completed },
          ])
          const recent = jobs
            .slice(0, 5)
            .map((row) => ({
              schedule_id: row.schedule_id,
              property: row.property_address || '—',
              lastUpdate: getLastUpdate(row),
              stage: getJobStage(row),
            }))
          setRecentJobUpdates(recent)
        } catch (err) {
          console.error(err)
        }
        return
      }
      try {
        const [propertiesRes, inspectionsRes, ownersRes, ticketsRes] = await Promise.all([
          api.get(endpoint.property.list),
          api.get(endpoint.inspection.inspections),
          api.get(endpoint.owner.get),
          api.get(endpoint.JobTicket.get),
        ])

        const nextStats = initialStats.map((item) => {
          switch (item.key) {
            case 'properties':
              return { ...item, value: propertiesRes.data.length }
            case 'inspections':
              return { ...item, value: inspectionsRes.data.length }
            case 'owners':
              return { ...item, value: ownersRes.data.length }
            case 'tickets':
              return { ...item, value: ticketsRes.data.length }
            default:
              return item
          }
        })
        setStats(nextStats)

        const tickets = ticketsRes.data.slice(0, 5).map((t) => ({
          id: t.id,
          property: t.schedule?.property?.address || '—',
          status: (t.status || '').toLowerCase(),
          date: t.assigned_at ? new Date(t.assigned_at).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '—',
        }))
        setRecentTickets(tickets)
      } catch (err) {
        console.error(err)
      }
    }

    loadStats()
  }, [isOwner, isInspector])

  const displayStats = isOwner ? ownerStats : isInspector ? inspectorStats : stats
  const quickActionsList = isOwner ? ownerQuickActions : isInspector ? inspectorQuickActions : quickActions

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">
          {isOwner
            ? 'Overview of your properties and inspection jobs'
            : isInspector
              ? 'Overview of your assigned job tickets'
              : 'Overview of inspection and property management'}
        </p>
      </div>

      <div
        className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${
          isOwner ? 'lg:grid-cols-5' : isInspector ? 'lg:grid-cols-3' : 'lg:grid-cols-4'
        }`}
      >
        {displayStats.map((item) => {
          const Icon = item.icon
          return (
            <div
              key={item.key}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md hover:border-slate-200 transition"
            >
              <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-slate-500 text-sm font-medium">{item.label}</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{item.value}</p>
            </div>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {isOwner ? (
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Recent job updates</h2>
              <Link
                to="/dashboard/my-jobs"
                className="text-sm font-medium text-violet-600 hover:text-violet-700 hover:underline flex items-center gap-1"
              >
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b border-slate-100 bg-slate-50/70">
                    <th className="py-3.5 px-6 font-medium">Property</th>
                    <th className="py-3.5 px-6 font-medium">Last update</th>
                    <th className="py-3.5 px-6 font-medium">Status</th>
                    <th className="py-3.5 px-6 font-medium w-24">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentJobUpdates.map((row) => (
                    <tr key={row.schedule_id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-6 font-medium text-slate-900">{row.property}</td>
                      <td className="py-3.5 px-6 text-slate-600">
                        {row.lastUpdate ? row.lastUpdate.toLocaleDateString(undefined, { dateStyle: 'medium' }) : '—'}
                      </td>
                      <td className="py-3.5 px-6">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                            row.stage === 'Completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : row.stage === 'Pending'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-sky-100 text-sky-800'
                          }`}
                        >
                          {row.stage}
                        </span>
                      </td>
                      <td className="py-3.5 px-6">
                        <Link
                          to="/dashboard/my-jobs"
                          className="inline-flex items-center text-violet-600 text-sm font-medium hover:underline"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : isInspector ? (
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Recent job tickets</h2>
              <Link
                to="/dashboard/jobtickets"
                className="text-sm font-medium text-violet-600 hover:text-violet-700 hover:underline flex items-center gap-1"
              >
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b border-slate-100 bg-slate-50/70">
                    <th className="py-3.5 px-6 font-medium">Property</th>
                    <th className="py-3.5 px-6 font-medium">Status</th>
                    <th className="py-3.5 px-6 font-medium">Assigned</th>
                    <th className="py-3.5 px-6 font-medium w-28">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentInspectorTickets.map((t) => (
                    <tr key={t.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-6 font-medium text-slate-900">{t.property}</td>
                      <td className="py-3.5 px-6">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                            t.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : t.status === 'in_progress'
                                ? 'bg-sky-100 text-sky-800'
                                : 'bg-violet-100 text-violet-800'
                          }`}
                        >
                          {t.status === 'in_progress' ? 'In progress' : t.status === 'assigned' ? 'Assigned' : t.status === 'completed' ? 'Completed' : t.status || '—'}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-slate-500">{t.date}</td>
                      <td className="py-3.5 px-6">
                        <Link
                          to={`/dashboard/jobtickets/${t.id}`}
                          className="inline-flex items-center text-violet-600 text-sm font-medium hover:underline"
                        >
                          View job
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Recent job tickets</h2>
              <Link
                to="/dashboard/jobtickets"
                className="text-sm font-medium text-violet-600 hover:text-violet-700 hover:underline flex items-center gap-1"
              >
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b border-slate-100 bg-slate-50/70">
                    <th className="py-3.5 px-6 font-medium">Property</th>
                    <th className="py-3.5 px-6 font-medium">Status</th>
                    <th className="py-3.5 px-6 font-medium">Assigned</th>
                    <th className="py-3.5 px-6 font-medium w-28">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTickets.map((t) => (
                    <tr key={t.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-6 font-medium text-slate-900">{t.property}</td>
                      <td className="py-3.5 px-6">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                            t.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : t.status === 'in_progress'
                                ? 'bg-sky-100 text-sky-800'
                                : 'bg-violet-100 text-violet-800'
                          }`}
                        >
                          {t.status === 'in_progress' ? 'In progress' : t.status === 'assigned' ? 'Assigned' : t.status === 'completed' ? 'Completed' : t.status || '—'}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-slate-500">{t.date}</td>
                      <td className="py-3.5 px-6">
                        <Link
                          to={`/dashboard/jobtickets/${t.id}`}
                          className="inline-flex items-center text-violet-600 text-sm font-medium hover:underline"
                        >
                          View job
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Quick actions</h2>
          <div className="space-y-2">
            {quickActionsList.map((action) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.label}
                  to={action.to}
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-violet-50/80 hover:border-violet-100 transition"
                >
                  <span className="w-9 h-9 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className="font-medium text-slate-700">{action.label}</span>
                  <ArrowRight className="w-4 h-4 text-slate-400 ml-auto" />
                </Link>
              )
            })}
          </div>
          {!isOwner && !isInspector && (
            <div className="mt-6 p-4 rounded-xl bg-violet-50/80 border border-violet-100">
              <div className="flex items-center gap-2 text-violet-600 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="font-medium text-sm">Insights</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{stats.find((s) => s.key === 'tickets')?.value ?? 0}</p>
              <p className="text-slate-500 text-xs">job tickets total</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
