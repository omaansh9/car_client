import { Navigate, Outlet } from 'react-router-dom'
import { useAdmin } from '../contexts/AdminContext.jsx'

const AdminProtectedRoute = () => {
  const { admin } = useAdmin()
  return admin ? <Outlet /> : <Navigate to="/admin" replace />
}

export default AdminProtectedRoute