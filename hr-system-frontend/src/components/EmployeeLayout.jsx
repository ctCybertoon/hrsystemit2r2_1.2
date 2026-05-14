import { NavLink, useNavigate } from 'react-router-dom'

const navItems = [
  { path: '/employee', label: '📊 Dashboard', end: true },
  { path: '/employee/profile', label: '👤 My Profile' },
  { path: '/employee/attendance', label: '🕐 My Attendance' },
  { path: '/employee/leave', label: '📅 My Leaves' },
  { path: '/employee/payroll', label: '💰 My Payroll' },
]

function EmployeeLayout({ children }) {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const handleLogout = () => {
    localStorage.clear()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-green-800 text-white flex flex-col">
        <div className="p-4 border-b border-green-700">
          <h1 className="text-lg font-bold">HR System</h1>
          <p className="text-xs text-green-300">Employee Portal</p>
        </div>
        <nav className="flex-1 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm hover:bg-green-700 transition ${isActive ? 'bg-green-600 font-semibold' : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-green-700">
          <p className="text-xs text-green-300 mb-2">{user.email}</p>
          <button onClick={handleLogout}
            className="w-full bg-red-500 hover:bg-red-600 text-white text-sm py-2 rounded">
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  )
}

export default EmployeeLayout