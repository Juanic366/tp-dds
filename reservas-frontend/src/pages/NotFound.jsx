import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '2rem' }}>
      <i className="ti ti-error-404" style={{ fontSize: 72, color: 'var(--text3)' }} aria-hidden="true" />
      <h2 style={{ fontWeight: 600, color: 'var(--text2)' }}>Página no encontrada</h2>
      <p style={{ color: 'var(--text3)', fontSize: 14 }}>La ruta que buscás no existe.</p>
      <button className="btn btn-primary" onClick={() => navigate('/reservas')}>
        <i className="ti ti-home" aria-hidden="true" /> Ir al inicio
      </button>
    </div>
  )
}
