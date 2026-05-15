import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

const navItems = [
  { path: '/admin', label: 'Dadshboard', end: true },
  { path: '/admin/employees', label: 'Employees' },
  { path: '/admin/departments', label: 'Departments' },
  { path: '/admin/locations', label: 'Locations' },
  { path: '/admin/users', label: 'Users' },
  { path: '/admin/attendance', label: 'Attendance' },
  { path: '/admin/leave', label: 'Leave Requests' },
  { path: '/admin/overtime', label: 'Overtime' },
  { path: '/admin/payroll', label: 'Payroll' },
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
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} flex flex-col transition-all duration-300`}
        style={{ background: '#3d5226' }}>
        <div className="p-4 flex items-center justify-between"
          style={{ borderBottom: '0.5px solid rgba(255,255,255,0.1)' }}>
          {sidebarOpen && (
            <div>
              <h1 className="text-base font-medium text-white">HR System</h1>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Admin Portal</p>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white text-sm">
            {sidebarOpen ? '<' : '>'}
          </button>
        </div>

        <nav className="flex-1 py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className="flex items-center px-4 py-3 text-sm transition-all"
              style={({ isActive }) => ({
                background: isActive ? '#4a6230' : 'transparent',
                borderLeft: isActive ? '3px solid #a8c97a' : '3px solid transparent',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.65)',
                fontWeight: isActive ? '500' : '400',
              })}
            >
              <span>{sidebarOpen ? item.label : item.label[0]}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4" style={{ borderTop: '0.5px solid rgba(255,255,255,0.1)' }}>
          {sidebarOpen && (
            <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.45)' }}>{user.email}</p>
          )}
          <button
            onClick={handleLogout}
            className="w-full text-white text-sm py-2 rounded"
            style={{ background: 'rgba(255,255,255,0.1)', border: '0.5px solid rgba(255,255,255,0.2)' }}
          >
            {sidebarOpen ? 'Sign out' : 'X'}
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 overflow-auto bg-gray-50">
        {children}
      </main>
    </div>
  )
}

export default AdminLayout