import { useEffect, useState } from 'react'
import axios from '../../api/axios'

function MyAttendance() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    const fetch = async () => {
      try {
        const [att, emp] = await Promise.all([
          axios.get('/attendance'),
          axios.get('/employees'),
        ])
        const myEmp = emp.data.find(e => e.user_id === user.id)
        if (myEmp) {
          setRecords(att.data.filter(a => a.employee_id === myEmp.id))
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const statusColor = {
    present: 'bg-green-100 text-green-700',
    absent: 'bg-red-100 text-red-600',
    late: 'bg-yellow-100 text-yellow-700'
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-600 border-t-transparent"></div>
    </div>
  )

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6"> My Attendance</h2>
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              {['Date', 'Time In', 'Time Out', 'Status'].map(h => (
                <th key={h} className="px-4 py-3 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {records.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-8 text-gray-400">No attendance records</td></tr>
            ) : records.map(r => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{r.date}</td>
                <td className="px-4 py-3">{r.time_in || '—'}</td>
                <td className="px-4 py-3">{r.time_out || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[r.status]}`}>
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default MyAttendance