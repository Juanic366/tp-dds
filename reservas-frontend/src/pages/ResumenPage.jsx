import { useEffect, useState } from 'react'
import { reservasService } from '../services/reservasService'
import StatusBadge from '../components/StatusBadge'
import Alert from '../components/Alert'
import { useNavigate } from 'react-router-dom'

function formatDate(str) {
  if (!str) return '—'
  return new Date(str + 'T00:00:00').toLocaleDateString('es-AR', {
    weekday: 'short', day: '2-digit', month: '2-digit'
  })
}

export default function ResumenPage() {
  const [resumen, setResumen] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    reservasService.resumen()
      .then(data => { setResumen(data); setError('') })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="loading-spinner" style={{ marginTop: '4rem' }}>
      <div className="spinner" /><span>Cargando resumen...</span>
    </div>
  )

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Panel de administración</h1>
        <p className="page-subtitle">Resumen del sistema de reservas</p>
      </div>

      <div className="page-body">
        <Alert type="error" message={error} />

        {resumen && (
          <>
            {/* Stats by estado */}
            <div className="card-title" style={{ marginBottom: '0.75rem' }}>Reservas por estado</div>
            <div className="stats-grid">
              {Object.entries(resumen.porEstado || {}).map(([estado, cantidad]) => (
                <div key={estado} className="stat-card">
                  <div className="stat-label">{estado}</div>
                  <div className={`stat-value`} style={{
                    color: estado === 'aprobada' ? 'var(--color-success)'
                      : estado === 'pendiente' ? 'var(--color-warning)'
                      : estado === 'cancelada' ? 'var(--color-text-muted)'
                      : 'var(--color-danger)'
                  }}>
                    {cantidad}
                  </div>
                  <div className="stat-sub">reservas</div>
                </div>
              ))}

              {resumen.total !== undefined && (
                <div className="stat-card">
                  <div className="stat-label">Total</div>
                  <div className="stat-value" style={{ color: 'var(--color-primary)' }}>{resumen.total}</div>
                  <div className="stat-sub">en el sistema</div>
                </div>
              )}
            </div>

            {/* Aulas más utilizadas */}
            {resumen.aulasMasUtilizadas && resumen.aulasMasUtilizadas.length > 0 && (
              <div className="card mb-4">
                <div className="card-title">Aulas más utilizadas</div>
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Aula</th>
                        <th>Ubicación</th>
                        <th>Total reservas</th>
                        <th>Capacidad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resumen.aulasMasUtilizadas.map((item, i) => (
                        <tr key={item.aulaId || i}>
                          <td style={{ color: 'var(--color-text-faint)', fontFamily: 'var(--font-mono)' }}>
                            {String(i + 1).padStart(2, '0')}
                          </td>
                          <td style={{ fontWeight: 600 }}>{item.nombre || item.aulaId}</td>
                          <td style={{ color: 'var(--color-text-muted)' }}>{item.ubicacion || '—'}</td>
                          <td>
                            <span style={{
                              fontFamily: 'var(--font-mono)',
                              color: 'var(--color-primary)',
                              fontWeight: 700
                            }}>
                              {item.total}
                            </span>
                          </td>
                          <td style={{ color: 'var(--color-text-muted)' }}>
                            {item.capacidad ? `${item.capacidad} pers.` : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Próximas reservas */}
            {resumen.proximasReservas && resumen.proximasReservas.length > 0 && (
              <div className="card">
                <div className="card-title">Próximas reservas aprobadas o pendientes</div>
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Horario</th>
                        <th>Aula</th>
                        <th>Motivo</th>
                        <th>Estado</th>
                        <th>Solicitante</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {resumen.proximasReservas.map(r => (
                        <tr key={r.id}>
                          <td style={{ fontWeight: 600 }}>{formatDate(r.fecha)}</td>
                          <td>
                            <span className="font-mono" style={{ fontSize: '0.8125rem' }}>
                              {r.horaInicio}–{r.horaFin}
                            </span>
                          </td>
                          <td>{r.aula?.nombre || r.aulaId}</td>
                          <td style={{ color: 'var(--color-text-muted)', maxWidth: 180 }}>
                            <span className="truncate" style={{ display: 'block' }}>{r.motivo}</span>
                          </td>
                          <td><StatusBadge estado={r.estado} /></td>
                          <td style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>
                            {r.usuario?.nombre || r.usuarioId}
                          </td>
                          <td>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => navigate(`/reservas/${r.id}`)}
                            >
                              Ver
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {(!resumen.proximasReservas || resumen.proximasReservas.length === 0) && (
              <div className="card">
                <div className="empty-state">
                  <span className="empty-icon">📅</span>
                  <span className="empty-title">Sin próximas reservas</span>
                  <span className="empty-desc">No hay reservas aprobadas o pendientes próximas.</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
