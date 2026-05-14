import { useEffect, useState } from 'react'
import axios from '../../api/axios'

const empty = { employee_id: '', basic_pay: '', overtime_pay: '0', deductions: '0', net_pay: '', pay_date: '' }

function Payroll() {
  const [records, setRecords] = useState([])
  const [employees, setEmployees] = useState([])
  const [form, setForm] = useState(empty)
  const [editId, setEditId] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState('')

  const fetchAll = async () => {
    const [pay, emp] = await Promise.all([
      axios.get('/payroll'),
      axios.get('/employees'),
    ])
    setRecords(pay.data)
    setEmployees(emp.data)
  }

  useEffect(() => { fetchAll() }, [])

  const openAdd = () => { setForm(empty); setEditId(null); setError(''); setShowModal(true) }
  const openEdit = (r) => {
    setForm({
      employee_id: r.employee_id, basic_pay: r.basic_pay,
      overtime_pay: r.overtime_pay, deductions: r.deductions,
      net_pay: r.net_pay, pay_date: r.pay_date
    })
    setEditId(r.id); setError(''); setShowModal(true)
  }

  const handleChange = (e) => {
    const updated = { ...form, [e.target.name]: e.target.value }
    const net = (parseFloat(updated.basic_pay) || 0) +
                (parseFloat(updated.overtime_pay) || 0) -
                (parseFloat(updated.deductions) || 0)
    updated.net_pay = net.toFixed(2)
    setForm(updated)
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('')
    try {
      if (editId) { await axios.put(`/payroll/${editId}`, form) }
      else { await axios.post('/payroll', form) }
      setShowModal(false); fetchAll()
    } catch (err) { setError(err.response?.data?.message || 'Something went wrong') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this payroll record?')) return
    await axios.delete(`/payroll/${id}`); fetchAll()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">💰 Payroll</h2>
        <button onClick={openAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          + Add Payroll
        </button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              {['Employee', 'Basic Pay', 'Overtime', 'Deductions', 'Net Pay', 'Pay Date', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {records.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8 text-gray-400">No payroll records yet</td></tr>
            ) : records.map(r => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{r.employee?.first_name} {r.employee?.last_name}</td>
                <td className="px-4 py-3">₱{Number(r.basic_pay).toLocaleString()}</td>
                <td className="px-4 py-3">₱{Number(r.overtime_pay).toLocaleString()}</td>
                <td className="px-4 py-3 text-red-500">-₱{Number(r.deductions).toLocaleString()}</td>
                <td className="px-4 py-3 font-semibold text-green-700">₱{Number(r.net_pay).toLocaleString()}</td>
                <td className="px-4 py-3">{r.pay_date}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => openEdit(r)} className="text-blue-600 hover:underline text-xs">Edit</button>
                  <button onClick={() => handleDelete(r.id)} className="text-red-500 hover:underline text-xs">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">{editId ? 'Edit Payroll' : 'Add Payroll'}</h3>
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-600">Basic Pay</label>
                  <input name="basic_pay" type="number" value={form.basic_pay} onChange={handleChange} required
                    className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Overtime Pay</label>
                  <input name="overtime_pay" type="number" value={form.overtime_pay} onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-600">Deductions</label>
                  <input name="deductions" type="number" value={form.deductions} onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Net Pay (auto)</label>
                  <input name="net_pay" type="number" value={form.net_pay} readOnly
                    className="w-full border rounded-lg px-3 py-2 text-sm mt-1 bg-gray-50" />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600">Pay Date</label>
                <input name="pay_date" type="date" value={form.pay_date} onChange={handleChange} required
                  className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm">
                  {editId ? 'Update' : 'Add Payroll'}
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

export default Payroll