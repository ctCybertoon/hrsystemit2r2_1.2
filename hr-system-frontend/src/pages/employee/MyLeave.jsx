import { useEffect, useState } from 'react'
import axios from '../../api/axios'

function MyLeave() {
  const [leaves, setLeaves] = useState([])
  const [leaveTypes, setLeaveTypes] = useState([])
  const [myEmployee, setMyEmployee] = useState(null)
  const [form, setForm] = useState({ leave_type_id: '', start_date: '', end_date: '', reason: '' })
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const fetchAll = async () => {
    try {
      const [leave, emp, lt] = await Promise.all([
        axios.get('/leave-appointments'),
        axios.get('/employees'),
        axios.get('/leave-types'),
      ])
      const myEmp = emp.data.find(e => e.user_id === user.id)
      setMyEmployee(myEmp)
      setLeaveTypes(lt.data)
      if (myEmp) {
        setLeaves(leave.data.filter(l => l.employee_id === myEmp.id))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await axios.post('/leave-appointments', {
        ...form, employee_id: myEmployee.id
      })
      setShowModal(false)
      fetchAll()
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    }
  }

  const statusColor = {
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-600'
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-600 border-t-transparent"></div>
    </div>
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">📅 My Leaves</h2>
        <button onClick={() => { setShowModal(true); setError('') }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
          + Request Leave
        </button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              {['Leave Type', 'Start', 'End', 'Reason', 'Status'].map(h => (
                <th key={h} className="px-4 py-3 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {leaves.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-400">No leave requests yet</td></tr>
            ) : leaves.map(l => (
              <tr key={l.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{l.leave_type?.name || '—'}</td>
                <td className="px-4 py-3">{l.start_date}</td>
                <td className="px-4 py-3">{l.end_date}</td>
                <td className="px-4 py-3 text-gray-500">{l.reason || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[l.status]}`}>
                    {l.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Request Leave</h3>
            {error && <div className="bg-red-100 text-red-600 px-4 py-2 rounded mb-4 text-sm">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-sm text-gray-600">Leave Type</label>
                <select name="leave_type_id" value={form.leave_type_id} onChange={handleChange} required
                  className="w-full border rounded-lg px-3 py-2 text-sm mt-1">
                  <option value="">Select Leave Type</option>
                  {leaveTypes.map(lt => (
                    <option key={lt.id} value={lt.id}>{lt.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-600">Start Date</label>
                  <input name="start_date" type="date" value={form.start_date} onChange={handleChange} required
                    className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
                </div>
                <div>
                  <label className="text-sm text-gray-600">End Date</label>
                  <input name="end_date" type="date" value={form.end_date} onChange={handleChange} required
                    className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600">Reason</label>
                <textarea name="reason" value={form.reason} onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 text-sm mt-1" rows={3} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit"
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 text-sm">
                  Submit Request
                </button>
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 text-sm">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyLeave