import { useEffect, useState } from 'react'
import axios from '../../api/axios'

const sharedStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
  * { box-sizing: border-box; }
  .hr-root { font-family: 'DM Sans', sans-serif; }
  .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
  .page-title { font-size: 22px; font-weight: 700; color: #2c3320; }
  .btn-primary { background: #6b7c52; color: #fff; border: none; padding: 9px 18px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: background 0.15s; letter-spacing: 0.01em; }
  .btn-primary:hover { background: #5a6944; }
  .table-wrap { background: #fff; border-radius: 12px; border: 1px solid #e8ede6; box-shadow: 0 1px 4px rgba(74,85,58,0.06); overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  thead { background: #f5f7f2; }
  th { padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 600; color: #7a8a66; text-transform: uppercase; letter-spacing: 0.07em; border-bottom: 1px solid #e8ede6; }
  td { padding: 13px 16px; color: #3c4830; border-bottom: 1px solid #f0f3ed; }
  tbody tr:last-child td { border-bottom: none; }
  tbody tr:hover { background: #fafbf8; }
  .td-muted { color: #8a9278; }
  .td-mono { font-family: 'DM Mono', monospace; font-size: 12px; }
  .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; text-transform: capitalize; }
  .badge-active { background: #eaf2e8; color: #4a6e3c; }
  .badge-inactive { background: #fdf0f0; color: #a03030; }
  .btn-link-edit { background: none; border: none; color: #6b7c52; font-size: 12px; font-weight: 600; cursor: pointer; padding: 0; font-family: 'DM Sans', sans-serif; }
  .btn-link-edit:hover { text-decoration: underline; }
  .btn-link-del { background: none; border: none; color: #b05050; font-size: 12px; font-weight: 600; cursor: pointer; padding: 0; font-family: 'DM Sans', sans-serif; }
  .btn-link-del:hover { text-decoration: underline; }
  .empty-row { text-align: center; padding: 48px !important; color: #b0ba9c !important; font-size: 13px; }
  .modal-overlay { position: fixed; inset: 0; background: rgba(30,36,22,0.45); display: flex; align-items: center; justify-content: center; z-index: 50; }
  .modal-box { background: #fff; border-radius: 14px; padding: 28px; width: 100%; max-width: 480px; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(30,36,22,0.18); }
  .modal-title { font-size: 17px; font-weight: 700; color: #2c3320; margin-bottom: 20px; }
  .field-label { font-size: 12px; font-weight: 600; color: #7a8a66; margin-bottom: 5px; display: block; letter-spacing: 0.04em; text-transform: uppercase; }
  .field-input { width: 100%; border: 1px solid #dde3d6; border-radius: 8px; padding: 9px 12px; font-size: 13px; font-family: 'DM Sans', sans-serif; color: #2c3320; background: #fafbf8; transition: border 0.15s, box-shadow 0.15s; outline: none; }
  .field-input:focus { border-color: #6b7c52; box-shadow: 0 0 0 3px rgba(107,124,82,0.12); background: #fff; }
  .field-group { margin-bottom: 14px; }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .error-banner { background: #fdf0f0; border: 1px solid #f0d0d0; color: #a03030; padding: 10px 14px; border-radius: 8px; font-size: 12px; margin-bottom: 14px; }
  .modal-actions { display: flex; gap: 10px; margin-top: 18px; }
  .btn-submit { flex: 1; background: #6b7c52; color: #fff; border: none; padding: 10px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: background 0.15s; }
  .btn-submit:hover { background: #5a6944; }
  .btn-cancel { flex: 1; background: #f2f4ef; color: #5a6650; border: none; padding: 10px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: background 0.15s; }
  .btn-cancel:hover { background: #e8ede2; }
`

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
      axios.get('/employees'), axios.get('/departments'), axios.get('/locations'),
    ])
    setEmployees(emp.data); setDepartments(dept.data); setLocations(loc.data)
  }

  useEffect(() => { fetchAll() }, [])

  const openAdd = () => { setForm(empty); setEditId(null); setError(''); setShowModal(true) }
  const openEdit = (emp) => {
    setForm({
      first_name: emp.first_name, last_name: emp.last_name, email: emp.email,
      phone: emp.phone || '', position: emp.position, salary: emp.salary,
      hire_date: emp.hire_date, status: emp.status,
      department_id: emp.department_id, location_id: emp.location_id, user_id: emp.user_id,
    })
    setEditId(emp.id); setError(''); setShowModal(true)
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('')
    try {
      if (editId) { await axios.put(`/employees/${editId}`, form) }
      else { await axios.post('/employees', form) }
      setShowModal(false); fetchAll()
    } catch (err) { setError(err.response?.data?.message || 'Something went wrong') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this employee?')) return
    await axios.delete(`/employees/${id}`); fetchAll()
  }

  return (
    <div className="hr-root">
      <style>{sharedStyles}</style>

      <div className="page-header">
        <div className="page-title">Employees</div>
        <button className="btn-primary" onClick={openAdd}>+ Add Employee</button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>{['Name', 'Email', 'Position', 'Department', 'Salary', 'Status', 'Actions'].map(h => <th key={h}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {employees.length === 0 ? (
              <tr><td colSpan={7} className="empty-row">No employees yet</td></tr>
            ) : employees.map(emp => (
              <tr key={emp.id}>
                <td style={{ fontWeight: 600 }}>{emp.first_name} {emp.last_name}</td>
                <td className="td-muted">{emp.email}</td>
                <td>{emp.position}</td>
                <td className="td-muted">{emp.department?.name || '—'}</td>
                <td className="td-mono">₱{Number(emp.salary).toLocaleString()}</td>
                <td>
                  <span className={`badge ${emp.status === 'active' ? 'badge-active' : 'badge-inactive'}`}>{emp.status}</span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button className="btn-link-edit" onClick={() => openEdit(emp)}>Edit</button>
                    <button className="btn-link-del" onClick={() => handleDelete(emp.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-title">{editId ? 'Edit Employee' : 'Add Employee'}</div>
            {error && <div className="error-banner">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="grid-2">
                <div className="field-group">
                  <label className="field-label">First Name</label>
                  <input className="field-input" name="first_name" value={form.first_name} onChange={handleChange} required />
                </div>
                <div className="field-group">
                  <label className="field-label">Last Name</label>
                  <input className="field-input" name="last_name" value={form.last_name} onChange={handleChange} required />
                </div>
              </div>
              <div className="field-group">
                <label className="field-label">Email</label>
                <input className="field-input" name="email" type="email" value={form.email} onChange={handleChange} required />
              </div>
              <div className="field-group">
                <label className="field-label">Phone</label>
                <input className="field-input" name="phone" value={form.phone} onChange={handleChange} />
              </div>
              <div className="field-group">
                <label className="field-label">Position</label>
                <input className="field-input" name="position" value={form.position} onChange={handleChange} required />
              </div>
              <div className="grid-2">
                <div className="field-group">
                  <label className="field-label">Salary</label>
                  <input className="field-input" name="salary" type="number" value={form.salary} onChange={handleChange} required />
                </div>
                <div className="field-group">
                  <label className="field-label">Hire Date</label>
                  <input className="field-input" name="hire_date" type="date" value={form.hire_date} onChange={handleChange} required />
                </div>
              </div>
              <div className="field-group">
                <label className="field-label">Department</label>
                <select className="field-input" name="department_id" value={form.department_id} onChange={handleChange} required>
                  <option value="">Select Department</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className="field-group">
                <label className="field-label">Location</label>
                <select className="field-input" name="location_id" value={form.location_id} onChange={handleChange} required>
                  <option value="">Select Location</option>
                  {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
              <div className="grid-2">
                <div className="field-group">
                  <label className="field-label">User ID</label>
                  <input className="field-input" name="user_id" type="number" value={form.user_id} onChange={handleChange} required />
                </div>
                <div className="field-group">
                  <label className="field-label">Status</label>
                  <select className="field-input" name="status" value={form.status} onChange={handleChange}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-submit">{editId ? 'Update Employee' : 'Add Employee'}</button>
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Employees