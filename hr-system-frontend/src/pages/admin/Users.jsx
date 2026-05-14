import { useEffect, useState } from 'react'
import axios from '../../api/axios'

const empty = { username: '', email: '', password: '', role: 'employee' }

function Users() {
  const [users, setUsers] = useState([])
  const [form, setForm] = useState(empty)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState('')

  const fetchAll = async () => {
    try {
      const res = await axios.get('/users')
      setUsers(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => { fetchAll() }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await axios.post('/register', form)
      setShowModal(false)
      setForm(empty)
      fetchAll()
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return
    await axios.delete(`/users/${id}`)
    fetchAll()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">🔑 Users</h2>
        <button onClick={() => { setShowModal(true); setError('') }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          + Add User
        </button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              {['#', 'Username', 'Email', 'Role', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-400">No users yet</td></tr>
            ) : users.map((u, i) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                <td className="px-4 py-3 font-medium">{u.username}</td>
                <td className="px-4 py-3 text-gray-500">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    u.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                  }`}>{u.role}</span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => handleDelete(u.id)}
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
            <h3 className="text-lg font-bold mb-4">Add New User</h3>
            {error && <div className="bg-red-100 text-red-600 px-4 py-2 rounded mb-4 text-sm">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-sm text-gray-600">Username</label>
                <input name="username" value={form.username} onChange={handleChange} required
                  className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
                  placeholder="e.g. johndoe" />
              </div>
              <div>
                <label className="text-sm text-gray-600">Email</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} required
                  className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
                  placeholder="e.g. john@hr.com" />
              </div>
              <div>
                <label className="text-sm text-gray-600">Password</label>
                <input name="password" type="password" value={form.password} onChange={handleChange} required
                  className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
                  placeholder="minimum 6 characters" />
              </div>
              <div>
                <label className="text-sm text-gray-600">Role</label>
                <select name="role" value={form.role} onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 text-sm mt-1">
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm">
                  Create User
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

export default Users