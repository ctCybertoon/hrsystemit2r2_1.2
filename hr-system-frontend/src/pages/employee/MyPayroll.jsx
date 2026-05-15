import { useEffect, useState } from 'react'
import axios from '../../api/axios'

function MyPayroll() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    const fetch = async () => {
      try {
        const [pay, emp] = await Promise.all([
          axios.get('/payroll'),
          axios.get('/employees'),
        ])
        const myEmp = emp.data.find(e => e.user_id === user.id)
        if (myEmp) {
          setRecords(pay.data.filter(p => p.employee_id === myEmp.id))
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-600 border-t-transparent"></div>
    </div>
  )

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6"> My Payroll</h2>
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              {['Pay Date', 'Basic Pay', 'Overtime', 'Deductions', 'Net Pay'].map(h => (
                <th key={h} className="px-4 py-3 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {records.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-400">No payroll records yet</td></tr>
            ) : records.map(r => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{r.pay_date}</td>
                <td className="px-4 py-3">₱{Number(r.basic_pay).toLocaleString()}</td>
                <td className="px-4 py-3">₱{Number(r.overtime_pay).toLocaleString()}</td>
                <td className="px-4 py-3 text-red-500">-₱{Number(r.deductions).toLocaleString()}</td>
                <td className="px-4 py-3 font-semibold text-green-700">₱{Number(r.net_pay).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default MyPayroll