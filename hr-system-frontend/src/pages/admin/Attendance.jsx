import { useEffect, useState } from 'react'
import axios from '../../api/axios'

const sharedStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
  * { box-sizing: border-box; }
  .hr-root { font-family: 'DM Sans', sans-serif; }
  .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
  .page-title { font-size: 22px; font-weight: 700; color: #2c3320; }
  .btn-primary { background: #6b7c52; color: #fff; border: none; padding: 9px 18px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: background 0.15s; }
  .btn-primary:hover { background: #5a6944; }
  .table-wrap { background: #fff; border-radius: 12px; border: 1px solid #e8ede6; box-shadow: 0 1px 4px rgba(74,85,58,0.06); overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  thead { background: #f5f7f2; }
  th { padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 600; color: #7a8a66; text-transform: uppercase; letter-spacing: 0.07em; border-bottom: 1px solid #e8ede6; }
  td { padding: 13px 16px; color: #3c4830; border-bottom: 1px solid #f0f3ed; vertical-align: middle; }
  tbody tr:last-child td { border-bottom: none; }
  tbody tr:hover { background: #fafbf8; }
  .td-muted { color: #8a9278; }
  .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; text-transform: capitalize; }
  .badge-present  { background: #eaf2e8; color: #3a6630; }
  .badge-absent   { background: #fdf0f0; color: #a03030; }
  .badge-late     { background: #fdf6e8; color: #8a6020; }
  .btn-link-edit { background: none; border: none; color: #6b7c52; font-size: 12px; font-weight: 600; cursor: pointer; padding: 0; font-family: 'DM Sans', sans-serif; }
  .btn-link-edit:hover { text-decoration: underline; }
  .btn-link-del { background: none; border: none; color: #b05050; font-size: 12px; font-weight: 600; cursor: pointer; padding: 0; font-family: 'DM Sans', sans-serif; }
  .btn-link-del:hover { text-decoration: underline; }
  .empty-row { text-align: center; padding: 48px !important; color: #b0ba9c !important; font-size: 13px; }
  .modal-overlay { position: fixed; inset: 0; background: rgba(30,36,22,0.45); display: flex; align-items: center; justify-content: center; z-index: 50; }
  .modal-box { background: #fff; border-radius: 14px; padding: 28px; width: 100%; max-width: 440px; box-shadow: 0 20px 60px rgba(30,36,22,0.18); }
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

  const openAdd = () => { setForm(empty); setEditId(null); setError(''); setShowModal(true) }
  const openEdit = (r) => {
    setForm({
      employee_id: r.employee_id, date: r.date,
      time_in: r.time_in || '', time_out: r.time_out || '', status: r.status
    })
    setEditId(r.id); setError(''); setShowModal(true)
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('')
    try {
      if (editId) { await axios.put(`/attendance/${editId}`, form) }
      else { await axios.post('/attendance', form) }
      setShowModal(false); fetchAll()
    } catch (err) { setError(err.response?.data?.message || 'Something went wrong') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this record?')) return
    await axios.delete(`/attendance/${id}`); fetchAll()
  }

  const badgeClass = { present: 'badge-present', absent: 'badge-absent', late: 'badge-late' }

  return (
    <div className="hr-root">
      <style>{sharedStyles}</style>

      <div className="page-header">
        <div className="page-title">Attendance</div>
        <button className="btn-primary" onClick={openAdd}>+ Add Record</button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>{['Employee', 'Date', 'Time In', 'Time Out', 'Status', 'Actions'].map(h => <th key={h}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr><td colSpan={6} className="empty-row">No records yet</td></tr>
            ) : records.map(r => (
              <tr key={r.id}>
                <td style={{ fontWeight: 600 }}>{r.employee?.first_name} {r.employee?.last_name}</td>
                <td className="td-muted">{r.date}</td>
                <td className="td-muted">{r.time_in || '—'}</td>
                <td className="td-muted">{r.time_out || '—'}</td>
                <td><span className={`badge ${badgeClass[r.status]}`}>{r.status}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button className="btn-link-edit" onClick={() => openEdit(r)}>Edit</button>
                    <button className="btn-link-del" onClick={() => handleDelete(r.id)}>Delete</button>
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
            <div className="modal-title">{editId ? 'Edit Record' : 'Add Attendance'}</div>
            {error && <div className="error-banner">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="field-group">
                <label className="field-label">Employee</label>
                <select className="field-input" name="employee_id" value={form.employee_id} onChange={handleChange} required>
                  <option value="">Select Employee</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
                </select>
              </div>
              <div className="field-group">
                <label className="field-label">Date</label>
                <input className="field-input" name="date" type="date" value={form.date} onChange={handleChange} required />
              </div>
              <div className="grid-2">
                <div className="field-group">
                  <label className="field-label">Time In</label>
                  <input className="field-input" name="time_in" type="time" value={form.time_in} onChange={handleChange} />
                </div>
                <div className="field-group">
                  <label className="field-label">Time Out</label>
                  <input className="field-input" name="time_out" type="time" value={form.time_out} onChange={handleChange} />
                </div>
              </div>
              <div className="field-group">
                <label className="field-label">Status</label>
                <select className="field-input" name="status" value={form.status} onChange={handleChange}>
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-submit">{editId ? 'Update Record' : 'Add Record'}</button>
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Attendance