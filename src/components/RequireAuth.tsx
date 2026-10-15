import { Navigate, Outlet, useLocation } from 'react-router-dom'
import APIs from '../services/APIs'

export default function RequireAuth() {
  const location = useLocation()

  if (!APIs.isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}
