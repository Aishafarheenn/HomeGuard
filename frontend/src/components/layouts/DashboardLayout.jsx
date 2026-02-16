import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';

function DashboardLayout() {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '▦' },
    { path: '/dashboard/properties', label: 'Properties', icon: '🏠' },
    { path: '/dashboard/inspections', label: 'Inspections', icon: '🔍' },
    { path: '/dashboard/profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      {open && (
        <aside className="w-64 bg-slate-900 text-white p-5 flex flex-col">
          <div className="text-2xl font-bold mb-8">HomeGuard</div>
          <nav className="flex flex-col gap-2 flex-1">
            {navItems.map((item) => {
              const isActive = item.path === '/dashboard' 
                ? location.pathname === item.path 
                : location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-gray-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <button
            onClick={handleLogout}
            className="w-full mt-4 px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 transition-all font-medium"
          >
            Logout
          </button>
        </aside>
      )}
      <div className="flex flex-col flex-1">
        <header className="h-16 bg-white border-b flex items-center px-6">
          <button
            onClick={() => setOpen(!open)}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition text-xl"
          >
            ☰
          </button>
        </header>
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
