import { useEffect, useState } from 'react'
import axios from '../../api/axios'

function StatCard({ label, value, color, icon }) {
  return (
    <div className={`bg-white rounded-xl shadow p-6 border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
        </div>
        <span className="text-4xl">{icon}</span>
      </div>
    </div>
  )
}

function Overview() {
  const [stats, setStats] = useState({
    employees: 0, departments: 0, pendingLeaves: 0, payrolls: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const [emp, dept, leave, payroll] = await Promise.all([
          axios.get('/employees'),
          axios.get('/departments'),
          axios.get('/leave-appointments'),
          axios.get('/payroll'),
        ])
        setStats({
          employees: emp.data.length,
          departments: dept.data.length,
          pendingLeaves: leave.data.filter(l => l.status === 'pending').length,
          payrolls: payroll.data.length,
        })
      } catch (err) {
        setError('Failed to load dashboard data')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
      <span className="ml-3 text-gray-500">Loading dashboard...</span>
    </div>
  )

  if (error) return (
    <div className="bg-red-100 text-red-600 px-4 py-3 rounded-lg">{error}</div>
  )

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Dashboard Overview</h2>
      <p className="text-gray-500 text-sm mb-6">Welcome back, Admin! Here's what's happening.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Total Employees"
          value={stats.employees}
          color="border-blue-500"
          icon="👥"
        />
        <StatCard
          label="Departments"
          value={stats.departments}
          color="border-green-500"
          icon="🏢"
        />
        <StatCard
          label="Pending Leaves"
          value={stats.pendingLeaves}
          color="border-yellow-500"
          icon="📅"
        />
        <StatCard
          label="Payroll Records"
          value={stats.payrolls}
          color="border-purple-500"
          icon="💰"
        />
      </div>
    </div>
  )
}

export default Overview