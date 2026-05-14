import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

const navItems = [
  { path: '/admin', label: '📊 Dashboard', end: true },
  { path: '/admin/employees', label: '👥 Employees' },
  { path: '/admin/departments', label: '🏢 Departments' },
  { path: '/admin/locations', label: '📍 Locations' },
  { path: '/admin/users', label: '🔑 Users' },
  { path: '/admin/attendance', label: '🕐 Attendance' },
  { path: '/admin/leave', label: '📅 Leave Requests' },
  { path: '/admin/overtime', label: '⏰ Overtime' },
  { path: '/admin/payroll', label: '💰 Payroll' },
]

function AdminLayout({ children }) {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const handleLogout = () => {
    localStorage.clear()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-blue-800 text-white flex flex-col transition-all duration-300`}>
        <div className="p-4 flex items-center justify-between border-b border-blue-700">
          {sidebarOpen && <h1 className="text-lg font-bold">HR System</h1>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white text-xl">
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        <nav className="flex-1 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm hover:bg-blue-700 transition ${isActive ? 'bg-blue-600 font-semibold' : ''}`
              }
            >
              <span>{sidebarOpen ? item.label : item.label.split(' ')[0]}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-blue-700">
          {sidebarOpen && <p className="text-xs text-blue-300 mb-2">{user.email}</p>}
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 hover:bg-red-600 text-white text-sm py-2 rounded"
          >
            {sidebarOpen ? 'Logout' : '🚪'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  )
}

export default AdminLayout