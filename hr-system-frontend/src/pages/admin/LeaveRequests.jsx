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
  .td-muted { color: #8a9278; font-size: 12px; }
  .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; text-transform: capitalize; }
  .badge-pending  { background: #fdf6e8; color: #8a6020; }
  .badge-approved { background: #eaf2e8; color: #3a6630; }
  .badge-rejected { background: #fdf0f0; color: #a03030; }
  .btn-link-approve { background: none; border: none; color: #3a6630; font-size: 12px; font-weight: 600; cursor: pointer; padding: 0; font-family: 'DM Sans', sans-serif; }
  .btn-link-approve:hover { text-decoration: underline; }
  .btn-link-reject { background: none; border: none; color: #8a6020; font-size: 12px; font-weight: 600; cursor: pointer; padding: 0; font-family: 'DM Sans', sans-serif; }
  .btn-link-reject:hover { text-decoration: underline; }
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
  .action-divider { color: #dde3d6; }
`

function LeaveRequests() {
  const [leaves, setLeaves] = useState([])
  const [employees, setEmployees] = useState([])
  const [leaveTypes, setLeaveTypes] = useState([])
  const [form, setForm] = useState({ employee_id: '', leave_type_id: '', start_date: '', end_date: '', reason: '' })
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState('')

  const fetchAll = async () => {
    const [l, e, lt] = await Promise.all([
      axios.get('/leave-appointments'),
      axios.get('/employees'),
      axios.get('/leave-types'),
    ])
    setLeaves(l.data); setEmployees(e.data); setLeaveTypes(lt.data)
  }

  useEffect(() => { fetchAll() }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('')
    try {
      await axios.post('/leave-appointments', form)
      setShowModal(false); fetchAll()
    } catch (err) { setError(err.response?.data?.message || 'Something went wrong') }
  }

  const handleApprove = async (id) => { await axios.patch(`/leave-appointments/${id}/approve`); fetchAll() }
  const handleReject  = async (id) => { await axios.patch(`/leave-appointments/${id}/reject`);  fetchAll() }
  const handleDelete  = async (id) => {
    if (!confirm('Delete this leave request?')) return
    await axios.delete(`/leave-appointments/${id}`); fetchAll()
  }

  const badgeClass = { pending: 'badge-pending', approved: 'badge-approved', rejected: 'badge-rejected' }

  return (
    <div className="hr-root">
      <style>{sharedStyles}</style>

      <div className="page-header">
        <div className="page-title">Leave Requests</div>
        <button className="btn-primary" onClick={() => { setShowModal(true); setError('') }}>+ New Request</button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>{['Employee', 'Leave Type', 'Start', 'End', 'Reason', 'Status', 'Actions'].map(h => <th key={h}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {leaves.length === 0 ? (
              <tr><td colSpan={7} className="empty-row">No leave requests yet</td></tr>
            ) : leaves.map(l => (
              <tr key={l.id}>
                <td style={{ fontWeight: 600 }}>{l.employee?.first_name} {l.employee?.last_name}</td>
                <td>{l.leave_type?.name || '—'}</td>
                <td className="td-muted">{l.start_date}</td>
                <td className="td-muted">{l.end_date}</td>
                <td className="td-muted" style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.reason || '—'}</td>
                <td><span className={`badge ${badgeClass[l.status]}`}>{l.status}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    {l.status === 'pending' && (
                      <>
                        <button className="btn-link-approve" onClick={() => handleApprove(l.id)}>Approve</button>
                        <span className="action-divider">|</span>
                        <button className="btn-link-reject" onClick={() => handleReject(l.id)}>Reject</button>
                        <span className="action-divider">|</span>
                      </>
                    )}
                    <button className="btn-link-del" onClick={() => handleDelete(l.id)}>Delete</button>
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
            <div className="modal-title">New Leave Request</div>
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
                <label className="field-label">Leave Type</label>
                <select className="field-input" name="leave_type_id" value={form.leave_type_id} onChange={handleChange} required>
                  <option value="">Select Leave Type</option>
                  {leaveTypes.map(lt => <option key={lt.id} value={lt.id}>{lt.name}</option>)}
                </select>
              </div>
              <div className="grid-2">
                <div className="field-group">
                  <label className="field-label">Start Date</label>
                  <input className="field-input" name="start_date" type="date" value={form.start_date} onChange={handleChange} required />
                </div>
                <div className="field-group">
                  <label className="field-label">End Date</label>
                  <input className="field-input" name="end_date" type="date" value={form.end_date} onChange={handleChange} required />
                </div>
              </div>
              <div className="field-group">
                <label className="field-label">Reason</label>
                <textarea className="field-input" name="reason" value={form.reason} onChange={handleChange} rows={3} placeholder="Optional reason..." style={{ resize: 'vertical' }} />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-submit">Submit Request</button>
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default LeaveRequests