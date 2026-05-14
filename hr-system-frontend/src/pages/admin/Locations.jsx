import { useEffect, useState } from 'react'
import axios from '../../api/axios'

const empty = { name: '', address: '', city: '', country: '' }

function Locations() {
  const [locations, setLocations] = useState([])
  const [form, setForm] = useState(empty)
  const [editId, setEditId] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState('')

  const fetchAll = async () => {
    const res = await axios.get('/locations')
    setLocations(res.data)
  }

  useEffect(() => { fetchAll() }, [])

  const openAdd = () => {
    setForm(empty)
    setEditId(null)
    setError('')
    setShowModal(true)
  }

  const openEdit = (loc) => {
    setForm({
      name: loc.name, address: loc.address || '',
      city: loc.city || '', country: loc.country || ''
    })
    setEditId(loc.id)
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
        await axios.put(`/locations/${editId}`, form)
      } else {
        await axios.post('/locations', form)
      }
      setShowModal(false)
      fetchAll()
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this location?')) return
    await axios.delete(`/locations/${id}`)
    fetchAll()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">📍 Locations</h2>
        <button onClick={openAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          + Add Location
        </button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              {['#', 'Name', 'Address', 'City', 'Country', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {locations.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">No locations yet</td></tr>
            ) : locations.map((loc, i) => (
              <tr key={loc.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                <td className="px-4 py-3 font-medium">{loc.name}</td>
                <td className="px-4 py-3 text-gray-500">{loc.address || '—'}</td>
                <td className="px-4 py-3 text-gray-500">{loc.city || '—'}</td>
                <td className="px-4 py-3 text-gray-500">{loc.country || '—'}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => openEdit(loc)}
                    className="text-blue-600 hover:underline text-xs">Edit</button>
                  <button onClick={() => handleDelete(loc.id)}
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
            <h3 className="text-lg font-bold mb-4">
              {editId ? 'Edit Location' : 'Add Location'}
            </h3>

            {error && <div className="bg-red-100 text-red-600 px-4 py-2 rounded mb-4 text-sm">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-sm text-gray-600">Location Name</label>
                <input name="name" value={form.name} onChange={handleChange} required
                  className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
                  placeholder="e.g. Main Office" />
              </div>
              <div>
                <label className="text-sm text-gray-600">Address</label>
                <input name="address" value={form.address} onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
                  placeholder="e.g. 123 Main St" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-600">City</label>
                  <input name="city" value={form.city} onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
                    placeholder="e.g. Davao City" />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Country</label>
                  <input name="country" value={form.country} onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
                    placeholder="e.g. Philippines" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm">
                  {editId ? 'Update' : 'Add Location'}
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

export default Locations