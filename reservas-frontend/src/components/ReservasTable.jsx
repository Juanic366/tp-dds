import { useNavigate } from 'react-router-dom'
import StatusBadge from './StatusBadge'
import { useAuth } from '../context/AuthContext'

function formatDate(str) {
  if (!str) return '—'
  return new Date(str).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function ReservasTable({ reservas, onAccion, loading }) {
  const navigate = useNavigate()
  const { isAdmin, user } = useAuth()

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner" />
        <span>Cargando reservas...</span>
      </div>
    )
  }

  if (!reservas.length) {
    return (
      <div className="empty-state">
        <span className="empty-icon">📭</span>
        <span className="empty-title">Sin reservas</span>
        <span className="empty-desc">No se encontraron reservas con los filtros aplicados.</span>
      </div>
    )
  }

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Aula</th>
            <th>Fecha</th>
            <th>Horario</th>
            <th>Personas</th>
            <th>Motivo</th>
            <th>Estado</th>
            {isAdmin && <th>Solicitante</th>}
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {reservas.map(r => {
            const esPropietario = r.usuarioId === user?.id || r.usuario?.id === user?.id
            const puedeEditar = isAdmin || (esPropietario && (r.estado === 'pendiente'))
            const puedeCancelar = isAdmin || (esPropietario && ['pendiente', 'aprobada'].includes(r.estado))
            const puedeAprobar = isAdmin && r.estado === 'pendiente'
            const puedeRechazar = isAdmin && r.estado === 'pendiente'

            return (
              <tr key={r.id}>
                <td>
                  <span className="font-mono text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    #{String(r.id).slice(-6)}
                  </span>
                </td>
                <td>
                  <span style={{ fontWeight: 600 }}>{r.aula?.nombre || r.aulaId}</span>
                </td>
                <td>{formatDate(r.fecha)}</td>
                <td>
                  <span className="font-mono text-sm">
                    {r.horaInicio}–{r.horaFin}
                  </span>
                </td>
                <td style={{ textAlign: 'center' }}>{r.cantidadPersonas}</td>
                <td style={{ maxWidth: 200 }}>
                  <span className="truncate" style={{ display: 'block', maxWidth: 180 }}>
                    {r.motivo}
                  </span>
                </td>
                <td><StatusBadge estado={r.estado} /></td>
                {isAdmin && (
                  <td style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>
                    {r.usuario?.nombre || r.usuarioId}
                  </td>
                )}
                <td>
                  <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => navigate(`/reservas/${r.id}`)}
                    >
                      Ver
                    </button>
                    {puedeEditar && (
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => navigate(`/reservas/${r.id}/editar`)}
                      >
                        Editar
                      </button>
                    )}
                    {puedeAprobar && (
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => onAccion('aprobar', r.id)}
                      >
                        Aprobar
                      </button>
                    )}
                    {puedeRechazar && (
                      <button
                        className="btn btn-warning btn-sm"
                        onClick={() => onAccion('rechazar', r.id)}
                      >
                        Rechazar
                      </button>
                    )}
                    {puedeCancelar && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => onAccion('cancelar', r.id)}
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
