import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  if (!user) return null

  const linkStyle = ({ isActive }) => ({
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '4px 10px', borderRadius: 6, fontSize: 14,
    fontWeight: isActive ? 600 : 400,
    color: isActive ? 'var(--brand)' : 'var(--text2)',
    textDecoration: 'none',
    background: isActive ? 'var(--brand-light)' : 'transparent',
    transition: '.15s',
  })

  return (
    <nav style={{
      background: 'var(--surface)', borderBottom: '1px solid var(--border)',
      padding: '0 1.5rem', display: 'flex', alignItems: 'center', gap: 8,
      height: 52, position: 'sticky', top: 0, zIndex: 100,
    }}>
      <NavLink to="/reservas" style={{ fontWeight: 700, fontSize: 16, color: 'var(--brand)', textDecoration: 'none', marginRight: 8 }}>
        <i className="ti ti-building-community" style={{ marginRight: 6 }} aria-hidden="true" />
        ReservasApp
      </NavLink>

      <NavLink to="/reservas" style={linkStyle}>
        <i className="ti ti-calendar" aria-hidden="true" /> Reservas
      </NavLink>

      <NavLink to="/aulas" style={linkStyle}>
        <i className="ti ti-building" aria-hidden="true" /> Aulas
      </NavLink>

      {isAdmin && (
        <NavLink to="/admin" style={linkStyle}>
          <i className="ti ti-chart-bar" aria-hidden="true" /> Panel admin
        </NavLink>
      )}

      <div style={{ flex: 1 }} />

      <span style={{ fontSize: 13, color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 6 }}>
        <i className="ti ti-user" aria-hidden="true" />
        {user.nombre}
        <span className={`badge ${user.rol === 'admin' ? 'badge-admin' : 'badge-user'}`} style={{ fontSize: 11 }}>
          {user.rol}
        </span>
      </span>

      <button className="btn btn-ghost btn-sm" onClick={logout}>
        <i className="ti ti-logout" aria-hidden="true" /> Salir
      </button>
    </nav>
  )
}
