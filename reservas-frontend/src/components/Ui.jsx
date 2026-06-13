import { useNavigate } from 'react-router-dom'

/* ── Badge de estado ────────────────────────────────────────────────── */
const BADGE_MAP = {
  pendiente: { cls: 'badge-pending',   icon: 'ti-clock'  },
  aprobada:  { cls: 'badge-approved',  icon: 'ti-check'  },
  rechazada: { cls: 'badge-rejected',  icon: 'ti-x'      },
  cancelada: { cls: 'badge-cancelled', icon: 'ti-ban'    },
}

export function BadgeEstado({ estado }) {
  const { cls, icon } = BADGE_MAP[estado] || BADGE_MAP.pendiente
  return (
    <span className={`badge ${cls}`}>
      <i className={`ti ${icon}`} aria-hidden="true" />
      {estado}
    </span>
  )
}

/* ── Botón volver ───────────────────────────────────────────────────── */
export function BtnVolver({ to = -1 }) {
  const nav = useNavigate()
  return (
    <button className="btn btn-ghost btn-sm" style={{ marginBottom: '1rem' }} onClick={() => nav(to)}>
      <i className="ti ti-arrow-left" aria-hidden="true" /> Volver
    </button>
  )
}

/* ── Empty state ────────────────────────────────────────────────────── */
export function Empty({ icon = 'ti-inbox', mensaje = 'Sin resultados' }) {
  return (
    <div className="empty">
      <i className={`ti ${icon}`} aria-hidden="true" />
      {mensaje}
    </div>
  )
}

/* ── Error inline ───────────────────────────────────────────────────── */
export function ErrorMsg({ children }) {
  if (!children) return null
  return (
    <p className="error-msg">
      <i className="ti ti-alert-circle" aria-hidden="true" />
      {children}
    </p>
  )
}

/* ── Spinner simple ─────────────────────────────────────────────────── */
export function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
      <i className="ti ti-loader-2" style={{ fontSize: 28, color: 'var(--brand)', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
