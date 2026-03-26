import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Shield,
  LayoutDashboard,
  Package,
  Home,
  UserCog,
  Users,
  Ticket,
  LogOut,
  Menu,
  ChevronLeft,
  MessageSquare,
  ClipboardList,
  ShieldCheck,
  AlertCircle,
  Bell,
  Loader2,
  CheckCheck,
  X,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { notificationsService } from '../../services/requests/notificationsService'


const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/dashboard/serviceitems', label: 'Services', icon: Package },
  { path: '/dashboard/properties', label: 'Properties', icon: Home },
  { path: '/dashboard/my-jobs', label: 'My Jobs', icon: ClipboardList },
  { path: '/dashboard/packages', label: 'Packages', icon: Package },
  { path: '/dashboard/payments', label: 'Payments', icon: ShieldCheck },
  { path: '/dashboard/inspector', label: 'Inspectors', icon: UserCog },
  { path: '/dashboard/owners', label: 'Owners', icon: Users },
  { path: '/dashboard/jobtickets', label: 'Job tickets', icon: Ticket },
  { path: '/dashboard/complaints', label: 'Complaints', icon: AlertCircle },
  { path: '/dashboard/feedback', label: 'Feedback', icon: MessageSquare },
]

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [notifLoading, setNotifLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const notifPanelRef = useRef(null)
  const notifBellRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  const roleNavMap = {
    admin: navItems.filter((item) => !['/dashboard/my-jobs', '/dashboard/packages'].includes(item.path)),
    owner: navItems.filter((item) =>
      ['/dashboard', '/dashboard/properties', '/dashboard/my-jobs', '/dashboard/packages', '/dashboard/payments', '/dashboard/complaints', '/dashboard/feedback'].includes(
        item.path
      )
    ),
    inspector: navItems.filter((item) =>
      ['/dashboard', '/dashboard/jobtickets', '/dashboard/feedback'].includes(
        item.path
      )
    ),
  }

  const visibleNav = roleNavMap[user?.role] ?? roleNavMap.inspector ?? []

  const refreshUnread = useCallback(async () => {
    try {
      const data = await notificationsService.getUnread()
      setUnreadCount(Array.isArray(data) ? data.length : 0)
    } catch {
      setUnreadCount(0)
    }
  }, [])

  const loadNotifications = useCallback(async () => {
    setNotifLoading(true)
    try {
      const data = await notificationsService.getMyNotifications()
      setNotifications(Array.isArray(data) ? data : [])
    } catch {
      setNotifications([])
    } finally {
      setNotifLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshUnread()
  }, [refreshUnread, location.pathname])

  useEffect(() => {
    if (!notifOpen) return
    loadNotifications()
  }, [notifOpen, loadNotifications])

  useEffect(() => {
    if (!notifOpen) return
    const onDoc = (e) => {
      if (
        notifPanelRef.current?.contains(e.target) ||
        notifBellRef.current?.contains(e.target)
      ) {
        return
      }
      setNotifOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [notifOpen])

  const handleMarkRead = async (id) => {
    try {
      await notificationsService.markAsRead(id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      )
      await refreshUnread()
    } catch {
      /* ignore */
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await notificationsService.markAllAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      await refreshUnread()
    } catch {
      /* ignore */
    }
  }

  const handleRemove = async (id) => {
    try {
      await notificationsService.deleteNotification(id)
      setNotifications((prev) => prev.filter((n) => n.id !== id))
      await refreshUnread()
    } catch {
      /* ignore */
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8F7FC]">
      {/* Sidebar - fixed height, scrolls only if nav overflows */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } h-full bg-white border-r border-slate-200 flex flex-col transition-all duration-200 shrink-0 overflow-hidden`}
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
          {visibleNav.map((item) => {
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

      {/* Main area - only this section scrolls */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0" />
          <div className="flex items-center gap-3 justify-end shrink-0">
            <div className="relative shrink-0">
              <button
                ref={notifBellRef}
                type="button"
                onClick={() => setNotifOpen((o) => !o)}
                className="relative p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-[#7C3AED] transition"
                aria-expanded={notifOpen}
                aria-haspopup="true"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-[#A78BFA] px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
            </div>

            {notifOpen && (
              <div
                ref={notifPanelRef}
                className="fixed right-3 top-16 z-50 flex w-[min(calc(100vw-1.5rem),20rem)] max-h-[min(24rem,70vh)] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg shadow-slate-200/50 sm:right-6"
                role="dialog"
                aria-label="Notifications"
              >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/80">
                    <span className="font-semibold text-slate-900 text-sm">Notifications</span>
                    <div className="flex items-center gap-1">
                      {notifications.some((n) => !n.is_read) && (
                        <button
                          type="button"
                          onClick={handleMarkAllRead}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-white hover:text-violet-600"
                          title="Mark all read"
                        >
                          <CheckCheck className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setNotifOpen(false)}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-white"
                        aria-label="Close"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="overflow-y-auto flex-1 min-h-0">
                    {notifLoading ? (
                      <div className="py-12 flex flex-col items-center justify-center text-slate-500 gap-2">
                        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
                        <span className="text-xs">Loading…</span>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="py-10 px-4 text-center text-sm text-slate-500">
                        No notifications yet.
                      </div>
                    ) : (
                      <ul className="divide-y divide-slate-100">
                        {notifications.map((n) => (
                          <li
                            key={n.id}
                            className={`px-4 py-3 text-left hover:bg-slate-50/80 transition ${
                              !n.is_read ? 'bg-violet-50/40' : ''
                            }`}
                          >
                            <button
                              type="button"
                              className="w-full text-left"
                              onClick={() => !n.is_read && handleMarkRead(n.id)}
                            >
                              <p className="text-sm text-slate-800 leading-snug">{n.message}</p>
                              <p className="text-xs text-slate-400 mt-1">
                                {n.sent_at
                                  ? new Date(n.sent_at).toLocaleString(undefined, {
                                      dateStyle: 'short',
                                      timeStyle: 'short',
                                    })
                                  : ''}
                              </p>
                            </button>
                            <div className="flex justify-end mt-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleRemove(n.id)
                                }}
                                className="text-xs text-slate-400 hover:text-red-600"
                              >
                                Dismiss
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
            )}

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

        <main className="flex-1 min-h-0 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout;
