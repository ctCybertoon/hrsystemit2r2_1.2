import { Routes, Route } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import Overview from './Overview'
import Employees from './Employees'
import Departments from './Departments'
import Locations from './Locations'
import Users from './Users'
import Attendance from './Attendance'
import LeaveRequests from './LeaveRequests'
import Overtime from './Overtime'
import Payroll from './Payroll'

function AdminDashboard() {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/departments" element={<Departments />} />
        <Route path="/locations" element={<Locations />} />
        <Route path="/users" element={<Users />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/leave" element={<LeaveRequests />} />
        <Route path="/overtime" element={<Overtime />} />
        <Route path="/payroll" element={<Payroll />} />
      </Routes>
    </AdminLayout>
  )
}

export default AdminDashboard