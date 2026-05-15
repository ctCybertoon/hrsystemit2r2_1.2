import { useEffect, useState } from 'react'
import axios from '../../api/axios'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

  .overview-root {
    font-family: 'DM Sans', sans-serif;
  }
  .stat-card {
    background: #fff;
    border-radius: 12px;
    padding: 24px;
    border: 1px solid #e8ede6;
    box-shadow: 0 1px 4px rgba(74, 85, 58, 0.06);
    transition: box-shadow 0.2s, transform 0.2s;
    position: relative;
    overflow: hidden;
  }
  .stat-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
  }
  .stat-card:hover {
    box-shadow: 0 6px 20px rgba(74, 85, 58, 0.12);
    transform: translateY(-2px);
  }
  .stat-card.olive::before  { background: #6b7c52; }
  .stat-card.sage::before   { background: #8fa373; }
  .stat-card.amber::before  { background: #b5974a; }
  .stat-card.moss::before   { background: #4a5538; }
  .stat-label { font-size: 12px; font-weight: 500; color: #8a9278; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 8px; }
  .stat-value { font-size: 36px; font-weight: 700; color: #2c3320; font-family: 'DM Mono', monospace; line-height: 1; }
  .stat-icon { position: absolute; right: 20px; top: 50%; transform: translateY(-50%); width: 48px; height: 48px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
  .stat-card.olive .stat-icon { background: #eef1e8; color: #6b7c52; }
  .stat-card.sage .stat-icon  { background: #f0f4ec; color: #8fa373; }
  .stat-card.amber .stat-icon { background: #f7f2e8; color: #b5974a; }
  .stat-card.moss .stat-icon  { background: #e8ede2; color: #4a5538; }
  .page-title { font-size: 22px; font-weight: 700; color: #2c3320; }
  .page-subtitle { font-size: 13px; color: #8a9278; margin-top: 4px; }
  .spinner { width: 36px; height: 36px; border: 3px solid #e8ede6; border-top-color: #6b7c52; border-radius: 50%; animation: spin 0.7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .error-box { background: #fdf2f2; border: 1px solid #f0d0d0; color: #a03030; padding: 12px 16px; border-radius: 10px; font-size: 13px; }
`

const IconUsers = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)
const IconBuilding = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/><path d="M3 9h6"/><path d="M3 15h6"/>
    <path d="M15 9h3"/><path d="M15 15h3"/>
  </svg>
)
const IconCalendar = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)
const IconDollar = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
)

function StatCard({ label, value, variant, icon }) {
  return (
    <div className={`stat-card ${variant}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-icon">{icon}</div>
    </div>
  )
}

function Overview() {
  const [stats, setStats] = useState({ employees: 0, departments: 0, pendingLeaves: 0, payrolls: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const [emp, dept, leave, payroll] = await Promise.all([
          axios.get('/employees'), axios.get('/departments'),
          axios.get('/leave-appointments'), axios.get('/payroll'),
        ])
        setStats({
          employees: emp.data.length, departments: dept.data.length,
          pendingLeaves: leave.data.filter(l => l.status === 'pending').length,
          payrolls: payroll.data.length,
        })
      } catch (err) {
        setError('Failed to load dashboard data')
        console.error(err)
      } finally { setLoading(false) }
    }
    fetchStats()
  }, [])

  return (
    <div className="overview-root">
      <style>{styles}</style>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: 12 }}>
          <div className="spinner" />
          <span style={{ color: '#8a9278', fontSize: 14 }}>Loading dashboard...</span>
        </div>
      ) : error ? (
        <div className="error-box">{error}</div>
      ) : (
        <>
          <div style={{ marginBottom: 28 }}>
            <div className="page-title">Dashboard Overview</div>
            <div className="page-subtitle">Welcome back, Admin. Here's your current snapshot.</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
            <StatCard label="Total Employees" value={stats.employees} variant="olive" icon={<IconUsers />} />
            <StatCard label="Departments" value={stats.departments} variant="sage" icon={<IconBuilding />} />
            <StatCard label="Pending Leaves" value={stats.pendingLeaves} variant="amber" icon={<IconCalendar />} />
            <StatCard label="Payroll Records" value={stats.payrolls} variant="moss" icon={<IconDollar />} />
          </div>
        </>
      )}
    </div>
  )
}

export default Overview