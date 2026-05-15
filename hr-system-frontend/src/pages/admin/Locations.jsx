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
  td { padding: 13px 16px; color: #3c4830; border-bottom: 1px solid #f0f3ed; }
  tbody tr:last-child td { border-bottom: none; }
  tbody tr:hover { background: #fafbf8; }
  .td-muted { color: #8a9278; }
  .td-num { color: #b0ba9c; font-size: 12px; }
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

  const openAdd = () => { setForm(empty); setEditId(null); setError(''); setShowModal(true) }
  const openEdit = (loc) => {
    setForm({ name: loc.name, address: loc.address || '', city: loc.city || '', country: loc.country || '' })
    setEditId(loc.id); setError(''); setShowModal(true)
  }
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('')
    try {
      if (editId) { await axios.put(`/locations/${editId}`, form) }
      else { await axios.post('/locations', form) }
      setShowModal(false); fetchAll()
    } catch (err) { setError(err.response?.data?.message || 'Something went wrong') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this location?')) return
    await axios.delete(`/locations/${id}`); fetchAll()
  }

  return (
    <div className="hr-root">
      <style>{sharedStyles}</style>

      <div className="page-header">
        <div className="page-title">Locations</div>
        <button className="btn-primary" onClick={openAdd}>+ Add Location</button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>{['#', 'Name', 'Address', 'City', 'Country', 'Actions'].map(h => <th key={h}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {locations.length === 0 ? (
              <tr><td colSpan={6} className="empty-row">No locations yet</td></tr>
            ) : locations.map((loc, i) => (
              <tr key={loc.id}>
                <td className="td-num">{i + 1}</td>
                <td style={{ fontWeight: 600 }}>{loc.name}</td>
                <td className="td-muted">{loc.address || '—'}</td>
                <td className="td-muted">{loc.city || '—'}</td>
                <td className="td-muted">{loc.country || '—'}</td>
                <td>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button className="btn-link-edit" onClick={() => openEdit(loc)}>Edit</button>
                    <button className="btn-link-del" onClick={() => handleDelete(loc.id)}>Delete</button>
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
            <div className="modal-title">{editId ? 'Edit Location' : 'Add Location'}</div>
            {error && <div className="error-banner">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="field-group">
                <label className="field-label">Location Name</label>
                <input className="field-input" name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Main Office" />
              </div>
              <div className="field-group">
                <label className="field-label">Address</label>
                <input className="field-input" name="address" value={form.address} onChange={handleChange} placeholder="e.g. 123 Main St" />
              </div>
              <div className="grid-2">
                <div className="field-group">
                  <label className="field-label">City</label>
                  <input className="field-input" name="city" value={form.city} onChange={handleChange} placeholder="e.g. Davao City" />
                </div>
                <div className="field-group">
                  <label className="field-label">Country</label>
                  <input className="field-input" name="country" value={form.country} onChange={handleChange} placeholder="e.g. Philippines" />
                </div>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-submit">{editId ? 'Update Location' : 'Add Location'}</button>
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Locations