import { Routes, Route } from 'react-router-dom'
import EmployeeLayout from '../../components/EmployeeLayout'  // ✅ must be EmployeeLayout
import Overview from './Overview'
import Profile from './Profile'
import MyAttendance from './MyAttendance'
import MyLeave from './MyLeave'
import MyPayroll from './MyPayroll'

function EmployeeDashboard() {
  return (
    <EmployeeLayout>
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/attendance" element={<MyAttendance />} />
        <Route path="/leave" element={<MyLeave />} />
        <Route path="/payroll" element={<MyPayroll />} />
      </Routes>
    </EmployeeLayout>
  )
}

export default EmployeeDashboard