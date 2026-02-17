import React, { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Shield,
  LayoutDashboard,
  Package,
  Home,
  ClipboardCheck,
  UserCog,
  Users,
  Ticket,
  Bell,
  LogOut,
  Menu,
  ChevronLeft,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/dashboard/serviceitems', label: 'Services', icon: Package },
  { path: '/dashboard/properties', label: 'Properties', icon: Home },
  { path: '/dashboard/inspections', label: 'Inspections', icon: ClipboardCheck },
  { path: '/dashboard/inspector', label: 'Inspectors', icon: UserCog },
  { path: '/dashboard/owners', label: 'Owners', icon: Users },
  { path: '/dashboard/jobtickets', label: 'Job tickets', icon: Ticket },
]

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen bg-[#F8F7FC]">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white border-r border-slate-200 flex flex-col transition-all duration-200 shrink-0`}
      >
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2.5 min-w-0">
            <span className="w-9 h-9 rounded-xl bg-[#EDE9FE] flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-[#7C3AED]" strokeWidth={2} />
            </span>
            {sidebarOpen && (
              <span className="font-bold text-[#1F2937] text-lg truncate">HomeGuard</span>
            )}
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-[#7C3AED] transition"
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              item.path === '/dashboard'
                ? location.pathname === '/dashboard'
                : location.pathname.startsWith(item.path)
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-[#EDE9FE] text-[#7C3AED] font-medium'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600 transition"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span>Log out</span>}
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <button
              className="relative p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-[#7C3AED] transition"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#A78BFA]" />
            </button>
            {user && (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <span className="text-sm text-slate-600">
                  <span className="font-medium text-[#1F2937]">{user.username || 'User'}</span>
                  <span className="text-slate-400 ml-1">({user.role})</span>
                </span>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
