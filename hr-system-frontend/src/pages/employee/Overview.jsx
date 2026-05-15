import { useEffect, useState } from 'react'
import axios from '../../api/axios'

function Overview() {
  const [stats, setStats] = useState({ attendance: 0, leaves: 0, payrolls: 0 })
  const [loading, setLoading] = useState(true)
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [att, leave, pay] = await Promise.all([
          axios.get('/attendance'),
          axios.get('/leave-appointments'),
          axios.get('/payroll'),
        ])
        setStats({
          attendance: att.data.length,
          leaves: leave.data.filter(l => l.status === 'pending').length,
          payrolls: pay.data.length,
        })
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-600 border-t-transparent"></div>
      <span className="ml-3 text-gray-500">Loading...</span>
    </div>
  )

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome, {user.username}! </h2>
      <p className="text-gray-500 text-sm mb-6">Here's your summary.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-green-500">
          <p className="text-sm text-gray-500">Attendance Records</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{stats.attendance}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-yellow-500">
          <p className="text-sm text-gray-500">Pending Leaves</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{stats.leaves}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-purple-500">
          <p className="text-sm text-gray-500">Payroll Records</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{stats.payrolls}</p>
        </div>
      </div>
    </div>
  )
}

export default Overview