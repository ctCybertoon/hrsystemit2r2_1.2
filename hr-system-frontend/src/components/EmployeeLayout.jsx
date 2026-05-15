import { NavLink, useNavigate } from 'react-router-dom'

const navItems = [
  { path: '/employee', label: 'Dashboard', end: true },
  { path: '/employee/profile', label: 'My Profile' },
  { path: '/employee/attendance', label: 'My Attendance' },
  { path: '/employee/leave', label: 'My Leaves' },
  { path: '/employee/payroll', label: 'My Payroll' },
]

function EmployeeLayout({ children }) {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const handleLogout = () => {
    localStorage.clear()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 flex flex-col" style={{ background: '#3d5226' }}>
        <div className="p-4" style={{ borderBottom: '0.5px solid rgba(255,255,255,0.1)' }}>
          <h1 className="text-base font-medium text-white">HR System</h1>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Employee Portal</p>
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
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4" style={{ borderTop: '0.5px solid rgba(255,255,255,0.1)' }}>
          <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.45)' }}>{user.email}</p>
          <button
            onClick={handleLogout}
            className="w-full text-white text-sm py-2 rounded"
            style={{ background: 'rgba(255,255,255,0.1)', border: '0.5px solid rgba(255,255,255,0.2)' }}
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-auto bg-gray-50">{children}</main>
    </div>
  )
}

export default EmployeeLayout