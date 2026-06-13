import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import ReservasPage from '../pages/ReservasPage'
import ReservaDetallePage from '../pages/ReservaDetallePage'
import ReservaFormPage from '../pages/ReservaFormPage'
import ResumenPage from '../pages/ResumenPage'
import NotFoundPage from '../pages/NotFoundPage'
import CallbackPage from "../pages/CallbackPage";
import LoginPage from "../pages/LoginPage";


function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <div className="loading-spinner"><div className="spinner" /><span>Cargando...</span></div>
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth()
  if (loading) return <div className="loading-spinner"><div className="spinner" /><span>Cargando...</span></div>
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/reservas" replace />
  return children
}

function PublicOnlyRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return null
  if (isAuthenticated) return <Navigate to="/reservas" replace />
  return children
}

function Routes_() {
  return (
    <Routes>
      <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
      <Route path="/callback" element={<CallbackPage />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/reservas" replace />} />
        <Route path="reservas" element={<ReservasPage />} />
        <Route path="reservas/nueva" element={<ReservaFormPage />} />
        <Route path="reservas/:id" element={<ReservaDetallePage />} />
        <Route path="reservas/:id/editar" element={<ReservaFormPage />} />
        <Route path="resumen" element={<AdminRoute><ResumenPage /></AdminRoute>} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes_ />
      </AuthProvider>
    </BrowserRouter>
  )
}