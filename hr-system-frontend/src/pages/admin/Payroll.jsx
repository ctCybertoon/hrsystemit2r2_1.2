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
  td { padding: 13px 16px; color: #3c4830; border-bottom: 1px solid #f0f3ed; vertical-align: middle; }
  tbody tr:last-child td { border-bottom: none; }
  tbody tr:hover { background: #fafbf8; }
  .td-muted { color: #8a9278; }
  .td-mono { font-family: 'DM Mono', monospace; font-size: 12px; }
  .td-deduction { font-family: 'DM Mono', monospace; font-size: 12px; color: #a03030; }
  .td-net { font-family: 'DM Mono', monospace; font-size: 13px; font-weight: 600; color: #3a6630; }
  .btn-link-edit { background: none; border: none; color: #6b7c52; font-size: 12px; font-weight: 600; cursor: pointer; padding: 0; font-family: 'DM Sans', sans-serif; }
  .btn-link-edit:hover { text-decoration: underline; }
  .btn-link-del { background: none; border: none; color: #b05050; font-size: 12px; font-weight: 600; cursor: pointer; padding: 0; font-family: 'DM Sans', sans-serif; }
  .btn-link-del:hover { text-decoration: underline; }
  .empty-row { text-align: center; padding: 48px !important; color: #b0ba9c !important; font-size: 13px; }
  .modal-overlay { position: fixed; inset: 0; background: rgba(30,36,22,0.45); display: flex; align-items: center; justify-content: center; z-index: 50; }
  .modal-box { background: #fff; border-radius: 14px; padding: 28px; width: 100%; max-width: 460px; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(30,36,22,0.18); }
  .modal-title { font-size: 17px; font-weight: 700; color: #2c3320; margin-bottom: 20px; }
  .field-label { font-size: 12px; font-weight: 600; color: #7a8a66; margin-bottom: 5px; display: block; letter-spacing: 0.04em; text-transform: uppercase; }
  .field-input { width: 100%; border: 1px solid #dde3d6; border-radius: 8px; padding: 9px 12px; font-size: 13px; font-family: 'DM Sans', sans-serif; color: #2c3320; background: #fafbf8; transition: border 0.15s, box-shadow 0.15s; outline: none; }
  .field-input:focus { border-color: #6b7c52; box-shadow: 0 0 0 3px rgba(107,124,82,0.12); background: #fff; }
  .field-input-readonly { width: 100%; border: 1px solid #e8ede6; border-radius: 8px; padding: 9px 12px; font-size: 13px; font-family: 'DM Mono', monospace; color: #3a6630; background: #f2f6f0; outline: none; font-weight: 600; }
  .field-group { margin-bottom: 14px; }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .error-banner { background: #fdf0f0; border: 1px solid #f0d0d0; color: #a03030; padding: 10px 14px; border-radius: 8px; font-size: 12px; margin-bottom: 14px; }
  .net-pay-note { font-size: 11px; color: #8a9278; margin-top: 4px; }
  .modal-actions { display: flex; gap: 10px; margin-top: 18px; }
  .btn-submit { flex: 1; background: #6b7c52; color: #fff; border: none; padding: 10px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: background 0.15s; }
  .btn-submit:hover { background: #5a6944; }
  .btn-cancel { flex: 1; background: #f2f4ef; color: #5a6650; border: none; padding: 10px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: background 0.15s; }
  .btn-cancel:hover { background: #e8ede2; }
  .divider { border: none; border-top: 1px solid #e8ede6; margin: 16px 0; }
`

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
    const net =
      (parseFloat(updated.basic_pay) || 0) +
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
    <div className="hr-root">
      <style>{sharedStyles}</style>

      <div className="page-header">
        <div className="page-title">Payroll</div>
        <button className="btn-primary" onClick={openAdd}>+ Add Payroll</button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {['Employee', 'Basic Pay', 'Overtime', 'Deductions', 'Net Pay', 'Pay Date', 'Actions'].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr><td colSpan={7} className="empty-row">No payroll records yet</td></tr>
            ) : records.map(r => (
              <tr key={r.id}>
                <td style={{ fontWeight: 600 }}>{r.employee?.first_name} {r.employee?.last_name}</td>
                <td className="td-mono">₱{Number(r.basic_pay).toLocaleString()}</td>
                <td className="td-mono">₱{Number(r.overtime_pay).toLocaleString()}</td>
                <td className="td-deduction">−₱{Number(r.deductions).toLocaleString()}</td>
                <td className="td-net">₱{Number(r.net_pay).toLocaleString()}</td>
                <td className="td-muted">{r.pay_date}</td>
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
            <div className="modal-title">{editId ? 'Edit Payroll Record' : 'Add Payroll Record'}</div>
            {error && <div className="error-banner">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="field-group">
                <label className="field-label">Employee</label>
                <select className="field-input" name="employee_id" value={form.employee_id} onChange={handleChange} required>
                  <option value="">Select Employee</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>
                  ))}
                </select>
              </div>

              <hr className="divider" />

              <div className="grid-2">
                <div className="field-group">
                  <label className="field-label">Basic Pay</label>
                  <input className="field-input" name="basic_pay" type="number" value={form.basic_pay} onChange={handleChange} required placeholder="0.00" />
                </div>
                <div className="field-group">
                  <label className="field-label">Overtime Pay</label>
                  <input className="field-input" name="overtime_pay" type="number" value={form.overtime_pay} onChange={handleChange} placeholder="0.00" />
                </div>
              </div>

              <div className="grid-2">
                <div className="field-group">
                  <label className="field-label">Deductions</label>
                  <input className="field-input" name="deductions" type="number" value={form.deductions} onChange={handleChange} placeholder="0.00" />
                </div>
                <div className="field-group">
                  <label className="field-label">Net Pay</label>
                  <input className="field-input-readonly" name="net_pay" type="number" value={form.net_pay} readOnly />
                  <div className="net-pay-note">Auto-calculated</div>
                </div>
              </div>

              <div className="field-group">
                <label className="field-label">Pay Date</label>
                <input className="field-input" name="pay_date" type="date" value={form.pay_date} onChange={handleChange} required />
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn-submit">{editId ? 'Update Record' : 'Add Payroll'}</button>
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Payroll