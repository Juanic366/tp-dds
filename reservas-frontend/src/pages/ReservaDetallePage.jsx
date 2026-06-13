import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { reservasService } from '../services/reservasService'
import { useAuth } from '../context/AuthContext'
import StatusBadge from '../components/StatusBadge'
import Historial from '../components/Historial'
import Alert from '../components/Alert'

function Campo({ label, children }) {
  return (
    <div className="detail-field">
      <span className="detail-field-label">{label}</span>
      <div className="detail-field-value">{children}</div>
    </div>
  )
}

function formatDate(str) {
  if (!str) return '—'
  return new Date(str + 'T00:00:00').toLocaleDateString('es-AR', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
  })
}

function formatDateTime(str) {
  if (!str) return '—'
  return new Date(str).toLocaleString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

export default function ReservaDetallePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAdmin, user } = useAuth()

  const [reserva, setReserva] = useState(null)
  const [historial, setHistorial] = useState([])
  const [loading, setLoading] = useState(true)
  const [histLoading, setHistLoading] = useState(true)
  const [error, setError] = useState('')
  const [accionError, setAccionError] = useState('')
  const [accionSuccess, setAccionSuccess] = useState('')

  useEffect(() => {
    setLoading(true)
    reservasService.obtener(id)
      .then(data => { setReserva(data.reserva || data); setError('') })
      .catch(err => setError(err.status === 404 ? 'Reserva no encontrada' : err.message))
      .finally(() => setLoading(false))

    setHistLoading(true)
    reservasService.historial(id)
      .then(data => setHistorial(Array.isArray(data) ? data : data.historial || []))
      .catch(() => setHistorial([]))
      .finally(() => setHistLoading(false))
  }, [id])

  async function ejecutarAccion(accion) {
    setAccionError('')
    setAccionSuccess('')
    try {
      if (accion === 'aprobar') await reservasService.aprobar(id)
      else if (accion === 'rechazar') await reservasService.rechazar(id)
      else if (accion === 'cancelar') await reservasService.cancelar(id)

      const data = await reservasService.obtener(id)
      setReserva(data.reserva || data)

      const hist = await reservasService.historial(id)
      setHistorial(Array.isArray(hist) ? hist : hist.historial || [])

      setAccionSuccess(`Reserva ${accion === 'aprobar' ? 'aprobada' : accion === 'rechazar' ? 'rechazada' : 'cancelada'} correctamente.`)
    } catch (err) {
      setAccionError(err.message)
    }
  }

  if (loading) return (
    <div className="loading-spinner" style={{ marginTop: '4rem' }}>
      <div className="spinner" />
      <span>Cargando reserva...</span>
    </div>
  )

  if (error) return (
    <div style={{ padding: '2rem' }}>
      <Alert type="error" message={error} />
      <Link to="/reservas" className="btn btn-secondary" style={{ marginTop: '1rem', display: 'inline-flex' }}>
        ← Volver
      </Link>
    </div>
  )

  if (!reserva) return null

  const esPropietario = reserva.usuarioId === user?.id || reserva.usuario?.id === user?.id
  const puedeCancelar = isAdmin || (esPropietario && ['pendiente', 'aprobada'].includes(reserva.estado))
  const puedeEditar = isAdmin || (esPropietario && reserva.estado === 'pendiente')
  const puedeAprobar = isAdmin && reserva.estado === 'pendiente'
  const puedeRechazar = isAdmin && reserva.estado === 'pendiente'

  return (
    <>
      <div className="page-header">
        <div className="flex items-center gap-3 mb-3">
          <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)}>← Volver</button>
          <span className="text-muted">Detalle de reserva</span>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="page-title">
              Reserva <span className="font-mono" style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>#{String(reserva.id).slice(-8)}</span>
            </h1>
            <p className="page-subtitle">{reserva.aula?.nombre || reserva.aulaId} · {formatDate(reserva.fecha)}</p>
          </div>
          <StatusBadge estado={reserva.estado} />
        </div>
      </div>

      <div className="page-body">
        <Alert type="error" message={accionError} onClose={() => setAccionError('')} />
        <Alert type="success" message={accionSuccess} onClose={() => setAccionSuccess('')} />

        <div className="detail-grid">
          {/* Left: main info */}
          <div className="flex flex-col gap-3">
            <div className="card">
              <div className="card-title">Datos de la reserva</div>
              <Campo label="Aula">{reserva.aula?.nombre || reserva.aulaId}</Campo>
              <Campo label="Ubicación">{reserva.aula?.ubicacion || '—'}</Campo>
              <Campo label="Capacidad del aula">{reserva.aula?.capacidad ? `${reserva.aula.capacidad} personas` : '—'}</Campo>
              <Campo label="Fecha">{formatDate(reserva.fecha)}</Campo>
              <Campo label="Horario">
                <span className="font-mono">{reserva.horaInicio} – {reserva.horaFin}</span>
              </Campo>
              <Campo label="Cantidad de personas">{reserva.cantidadPersonas}</Campo>
              <Campo label="Motivo">{reserva.motivo}</Campo>
              <Campo label="Solicitante">{reserva.usuario?.nombre || reserva.usuarioId}</Campo>
              <Campo label="Creada el">{formatDateTime(reserva.createdAt)}</Campo>
              {reserva.aula?.recursos && (
                <Campo label="Recursos del aula">
                  <span style={{ color: 'var(--color-text-muted)' }}>
                    {Array.isArray(reserva.aula.recursos)
                      ? reserva.aula.recursos.join(', ')
                      : reserva.aula.recursos}
                  </span>
                </Campo>
              )}
            </div>

            {/* Action buttons */}
            {(puedeEditar || puedeCancelar || puedeAprobar || puedeRechazar) && (
              <div className="card">
                <div className="card-title">Acciones</div>
                <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                  {puedeEditar && (
                    <button className="btn btn-secondary" onClick={() => navigate(`/reservas/${id}/editar`)}>
                      ✎ Editar reserva
                    </button>
                  )}
                  {puedeAprobar && (
                    <button className="btn btn-success" onClick={() => ejecutarAccion('aprobar')}>
                      ✓ Aprobar
                    </button>
                  )}
                  {puedeRechazar && (
                    <button className="btn btn-warning" onClick={() => ejecutarAccion('rechazar')}>
                      ✗ Rechazar
                    </button>
                  )}
                  {puedeCancelar && (
                    <button className="btn btn-danger" onClick={() => ejecutarAccion('cancelar')}>
                      ○ Cancelar reserva
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right: historial */}
          <div className="card" style={{ alignSelf: 'start' }}>
            <div className="card-title">Historial de cambios</div>
            <Historial items={historial} loading={histLoading} />
          </div>
        </div>
      </div>
    </>
  )
}
