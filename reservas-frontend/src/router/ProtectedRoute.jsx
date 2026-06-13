import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/** Redirige al login si no hay sesión */
export function RequireAuth() {
  const { user } = useAuth()
  return user ? <Outlet /> : <Navigate to="/login" replace />
}

/** Redirige a /reservas si el rol no es admin */
export function RequireAdmin() {
  const { user, isAdmin } = useAuth()
  if (!user)    return <Navigate to="/login"    replace />
  if (!isAdmin) return <Navigate to="/reservas" replace />
  return <Outlet />
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  console.log("AUTH:", isAuthenticated)
  console.log("LOADING:", loading)

  if (loading) return <div>Cargando...</div>
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}