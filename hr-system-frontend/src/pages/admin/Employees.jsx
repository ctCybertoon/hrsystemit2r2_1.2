import { useEffect, useState } from 'react'
import axios from '../../api/axios'

const empty = {
  first_name: '', last_name: '', email: '', phone: '',
  position: '', salary: '', hire_date: '', status: 'active',
  department_id: '', location_id: '', user_id: ''
}

function Employees() {
  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([])
  const [locations, setLocations] = useState([])
  const [form, setForm] = useState(empty)
  const [editId, setEditId] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState('')

  const fetchAll = async () => {
    const [emp, dept, loc] = await Promise.all([
      axios.get('/employees'),
      axios.get('/departments'),
      axios.get('/locations'),
    ])
    setEmployees(emp.data)
    setDepartments(dept.data)
    setLocations(loc.data)
  }

  useEffect(() => { fetchAll() }, [])

  const openAdd = () => {
    setForm(empty)
    setEditId(null)
    setError('')
    setShowModal(true)
  }

  const openEdit = (emp) => {
    setForm({
      first_name: emp.first_name, last_name: emp.last_name,
      email: emp.email, phone: emp.phone || '',
      position: emp.position, salary: emp.salary,
      hire_date: emp.hire_date, status: emp.status,
      department_id: emp.department_id,
      location_id: emp.location_id,
      user_id: emp.user_id,
    })
    setEditId(emp.id)
    setError('')
    setShowModal(true)
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (editId) {
        await axios.put(`/employees/${editId}`, form)
      } else {
        await axios.post('/employees', form)
      }
      setShowModal(false)
      fetchAll()
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this employee?')) return
    await axios.delete(`/employees/${id}`)
    fetchAll()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">👥 Employees</h2>
        <button onClick={openAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          + Add Employee
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              {['Name', 'Email', 'Position', 'Department', 'Salary', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {employees.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8 text-gray-400">No employees yet</td></tr>
            ) : employees.map(emp => (
              <tr key={emp.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{emp.first_name} {emp.last_name}</td>
                <td className="px-4 py-3 text-gray-500">{emp.email}</td>
                <td className="px-4 py-3">{emp.position}</td>
                <td className="px-4 py-3">{emp.department?.name || '—'}</td>
                <td className="px-4 py-3">₱{Number(emp.salary).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    emp.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                  }`}>{emp.status}</span>
                </td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => openEdit(emp)}
                    className="text-blue-600 hover:underline text-xs">Edit</button>
                  <button onClick={() => handleDelete(emp.id)}
                    className="text-red-500 hover:underline text-xs">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg max-h-screen overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">{editId ? 'Edit Employee' : 'Add Employee'}</h3>

            {error && <div className="bg-red-100 text-red-600 px-4 py-2 rounded mb-4 text-sm">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-600">First Name</label>
                  <input name="first_name" value={form.first_name} onChange={handleChange} required
                    className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Last Name</label>
                  <input name="last_name" value={form.last_name} onChange={handleChange} required
                    className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600">Email</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} required
                  className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
              </div>

              <div>
                <label className="text-sm text-gray-600">Phone</label>
                <input name="phone" value={form.phone} onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
              </div>

              <div>
                <label className="text-sm text-gray-600">Position</label>
                <input name="position" value={form.position} onChange={handleChange} required
                  className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-600">Salary</label>
                  <input name="salary" type="number" value={form.salary} onChange={handleChange} required
                    className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Hire Date</label>
                  <input name="hire_date" type="date" value={form.hire_date} onChange={handleChange} required
                    className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600">Department</label>
                <select name="department_id" value={form.department_id} onChange={handleChange} required
                  className="w-full border rounded-lg px-3 py-2 text-sm mt-1">
                  <option value="">Select Department</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-600">Location</label>
                <select name="location_id" value={form.location_id} onChange={handleChange} required
                  className="w-full border rounded-lg px-3 py-2 text-sm mt-1">
                  <option value="">Select Location</option>
                  {locations.map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-600">User ID</label>
                <input name="user_id" type="number" value={form.user_id} onChange={handleChange} required
                  className="w-full border rounded-lg px-3 py-2 text-sm mt-1" placeholder="e.g. 1" />
              </div>

              <div>
                <label className="text-sm text-gray-600">Status</label>
                <select name="status" value={form.status} onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 text-sm mt-1">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm">
                  {editId ? 'Update' : 'Add Employee'}
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

export default Employees