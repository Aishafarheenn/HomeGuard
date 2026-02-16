
import React, { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
// import { useAuth } from '../../context/AuthContext'

function DashboardLayout() {
  const [open, setOpen] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '▦' },
    { path: '/dashboard/blog', label: 'Blogs', icon: '✎' },
    { path: '/dashboard/events', label: 'Events', icon: '◷' },
    { path: '/dashboard/safteyincharge', label: 'safteyinCharge', icon: '◷' },
    { path: '/dashboard/reports', label: 'Reports', icon: '◷' },
  ]
  

  return (
    <div className="flex min-h-screen w-full bg-gradient-to-br from-pink-100 to-amber-50">
      {/* SIDEBAR */}
      {open && (
        <aside className="w-56 bg-white/80 backdrop-blur-sm border-r border-pink-200/50 p-5 shrink-0 shadow-sm">
          <div className="text-xl font-bold text-pink-800 mb-8 flex items-center gap-2">
            <span className="text-2xl">✦</span>
            RAISE VOICE
          </div>

          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = item.path === '/dashboard' 
                ? location.pathname === item.path 
                : location.pathname.startsWith(item.path)
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-pink-300 text-pink-900 shadow-sm'
                      : 'text-gray-600 hover:bg-pink-100/80 hover:text-pink-800'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <button
            onClick={handleLogout}
            className="w-full mt-8 px-4 py-3 rounded-xl bg-pink-200/80 text-pink-800 font-medium hover:bg-pink-300 transition-all text-sm"
          >
            Logout
          </button>
        </aside>
      )}

      {/* MAIN AREA */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* HEADER */}
        <header className="h-16 bg-white/60 backdrop-blur-sm border-b border-pink-200/50 flex items-center justify-between px-6 sticky top-0 z-50 shadow-sm">
          <button
            onClick={() => setOpen(!open)}
            className="p-2 rounded-lg bg-pink-100/80 text-pink-800 hover:bg-pink-200/80 transition"
          >
            ☰
          </button>

          <div className="flex items-center gap-4">
            <button className="p-2 rounded-lg text-gray-500 hover:bg-pink-100/80 hover:text-pink-700 transition">
              <span className="text-lg">🔍</span>
            </button>
            <button className="p-2 rounded-lg text-gray-500 hover:bg-pink-100/80 hover:text-pink-700 transition">
              <span className="text-lg">🔔</span>
            </button>
            <div className="flex items-center gap-3 pl-2 border-l border-pink-200/50">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-300 to-amber-200 flex items-center justify-center text-pink-800 font-semibold text-sm">
                S
              </div>
              <span className="text-sm font-medium text-gray-700 hidden sm:block">Student</span>
            </div>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout