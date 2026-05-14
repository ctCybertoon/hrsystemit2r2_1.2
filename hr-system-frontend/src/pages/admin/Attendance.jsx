import { useEffect, useState } from 'react'
import axios from '../../api/axios'

const empty = { employee_id: '', date: '', time_in: '', time_out: '', status: 'present' }

function Attendance() {
  const [records, setRecords] = useState([])
  const [employees, setEmployees] = useState([])
  const [form, setForm] = useState(empty)
  const [editId, setEditId] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState('')

  const fetchAll = async () => {
  try {
    const [att, emp] = await Promise.all([
      axios.get('/attendance'),
      axios.get('/employees'),
    ])
    setRecords(Array.isArray(att.data) ? att.data : [])
    setEmployees(Array.isArray(emp.data) ? emp.data : [])
  } catch (err) {
    console.error('Error:', err.response?.data)
  }
}

useEffect(() => { fetchAll() }, [])


  useEffect(() => { fetchAll() }, [])

  const openAdd = () => {
    setForm(empty)
    setEditId(null)
    setError('')
    setShowModal(true)
  }

  const openEdit = (r) => {
    setForm({
      employee_id: r.employee_id, date: r.date,
      time_in: r.time_in || '', time_out: r.time_out || '',
      status: r.status
    })
    setEditId(r.id)
    setError('')
    setShowModal(true)
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (editId) {
        await axios.put(`/attendance/${editId}`, form)
      } else {
        await axios.post('/attendance', form)
      }
      setShowModal(false)
      fetchAll()
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this record?')) return
    await axios.delete(`/attendance/${id}`)
    fetchAll()
  }

  const statusColor = {
    present: 'bg-green-100 text-green-700',
    absent: 'bg-red-100 text-red-600',
    late: 'bg-yellow-100 text-yellow-700'
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">🕐 Attendance</h2>
        <button onClick={openAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          + Add Record
        </button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              {['Employee', 'Date', 'Time In', 'Time Out', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {records.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">No records yet</td></tr>
            ) : records.map(r => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">
                  {r.employee?.first_name} {r.employee?.last_name}
                </td>
                <td className="px-4 py-3">{r.date}</td>
                <td className="px-4 py-3">{r.time_in || '—'}</td>
                <td className="px-4 py-3">{r.time_out || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[r.status]}`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => openEdit(r)}
                    className="text-blue-600 hover:underline text-xs">Edit</button>
                  <button onClick={() => handleDelete(r.id)}
                    className="text-red-500 hover:underline text-xs">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">{editId ? 'Edit Record' : 'Add Attendance'}</h3>
            {error && <div className="bg-red-100 text-red-600 px-4 py-2 rounded mb-4 text-sm">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-sm text-gray-600">Employee</label>
                <select name="employee_id" value={form.employee_id} onChange={handleChange} required
                  className="w-full border rounded-lg px-3 py-2 text-sm mt-1">
                  <option value="">Select Employee</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600">Date</label>
                <input name="date" type="date" value={form.date} onChange={handleChange} required
                  className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-600">Time In</label>
                  <input name="time_in" type="time" value={form.time_in} onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Time Out</label>
                  <input name="time_out" type="time" value={form.time_out} onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600">Status</label>
                <select name="status" value={form.status} onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 text-sm mt-1">
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm">
                  {editId ? 'Update' : 'Add Record'}
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

export default Attendance