import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const initials = user?.nombre
    ? user.nombre.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>
            <span className="logo-icon">🏫</span>
            <div>
              Reservas
              <div className="logo-sub">Sistema de aulas</div>
            </div>
          </h1>
        </div>

        <nav className="sidebar-nav">
          <span className="sidebar-section">Navegación</span>

          <NavLink to="/reservas" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <span className="nav-icon">📋</span>
            Reservas
          </NavLink>

          {isAdmin && (
            <NavLink to="/resumen" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <span className="nav-icon">📊</span>
              Panel Resumen
            </NavLink>
          )}

          <span className="sidebar-section" style={{ marginTop: '0.5rem' }}>Acciones</span>

          <NavLink to="/reservas/nueva" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <span className="nav-icon">➕</span>
            Nueva Reserva
          </NavLink>
        </nav>

        <div className="sidebar-user">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <div className="user-name">{user?.nombre}</div>
            <div className="user-role">{user?.rol === 'admin' ? 'Administrador' : 'Usuario'}</div>
          </div>
          <button className="btn-logout" onClick={handleLogout} title="Cerrar sesión">
            ↩
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
