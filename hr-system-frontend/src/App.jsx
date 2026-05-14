import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/auth/Login'
import AdminDashboard from './pages/admin/Dashboard'
import EmployeeDashboard from './pages/employee/Dashboard'
import PrivateRoute from './components/PrivateRoute'

function App() {
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/admin/*" element={
        <PrivateRoute role="admin">
          <AdminDashboard />
        </PrivateRoute>
      } />
      <Route path="/employee/*" element={
        <PrivateRoute role="employee">
          <EmployeeDashboard />
        </PrivateRoute>
      } />
      <Route path="*" element={
        token
          ? role === 'admin'
            ? <Navigate to="/admin" />
            : <Navigate to="/employee" />
          : <Navigate to="/login" />
      } />
    </Routes>
  )
}

export default App