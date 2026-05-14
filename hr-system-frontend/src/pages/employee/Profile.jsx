import { useEffect, useState } from 'react'
import axios from '../../api/axios'

function Profile() {
  const [employee, setEmployee] = useState(null)
  const [loading, setLoading] = useState(true)
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get('/employees')
        const emp = res.data.find(e => e.user_id === user.id)
        setEmployee(emp)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-600 border-t-transparent"></div>
    </div>
  )

  if (!employee) return (
    <div className="bg-yellow-100 text-yellow-700 px-4 py-3 rounded-lg">
      No employee profile found for your account.
    </div>
  )

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">👤 My Profile</h2>
      <div className="bg-white rounded-xl shadow p-6 max-w-lg">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center text-white text-2xl font-bold">
            {employee.first_name[0]}{employee.last_name[0]}
          </div>
          <div>
            <h3 className="text-xl font-bold">{employee.first_name} {employee.last_name}</h3>
            <p className="text-gray-500">{employee.position}</p>
          </div>
        </div>
        <div className="space-y-3 text-sm">
          {[
            { label: 'Email', value: employee.email },
            { label: 'Phone', value: employee.phone || '—' },
            { label: 'Department', value: employee.department?.name || '—' },
            { label: 'Location', value: employee.location?.name || '—' },
            { label: 'Hire Date', value: employee.hire_date },
            { label: 'Status', value: employee.status },
            { label: 'Salary', value: `₱${Number(employee.salary).toLocaleString()}` },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between border-b pb-2">
              <span className="text-gray-500 font-medium">{label}</span>
              <span className="text-gray-800">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Profile