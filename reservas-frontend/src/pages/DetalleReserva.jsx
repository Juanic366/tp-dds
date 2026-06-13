import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { BadgeEstado, BtnVolver, Spinner, ErrorMsg } from '../components/Ui'
import { aulasAPI, reservasAPI } from '../lib/api'

const LABEL_ACCION = {
  creacion:   'Reserva creada',
  edicion:    'Reserva editada',
  aprobacion: 'Reserva aprobada',
  rechazo:    'Reserva rechazada',
  cancelacion:'Reserva cancelada',
}

export default function DetalleReserva() {
  const { id } = useParams()
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()

  const [reserva,   setReserva]   = useState(null)
  const [aula,      setAula]      = useState(null)
  const [historial, setHistorial] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')
  const [accionando, setAccionando] = useState(false)

  const cargar = async () => {
    setLoading(true)
    setError('')
    try {
      const [r, h] = await Promise.all([
        reservasAPI.getById(id),
        reservasAPI.historial(id),
      ])
      setReserva(r)
      setHistorial(h)
      // cargar aula aparte (no bloqueante si falla)
      aulasAPI.getById(r.aulaId).then(setAula).catch(() => {})
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargar() }, [id])

  const accion = async (fn) => {
    setAccionando(true)
    try {
      await fn()
      await cargar()
    } catch (e) {
      setError(e.message)
    } finally {
      setAccionando(false)
    }
  }

  if (loading) return <div className="page-narrow"><Spinner /></div>
  if (error && !reserva) return (
    <div className="page-narrow">
      <BtnVolver to="/reservas" />
      <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
        <i className="ti ti-mood-confused" style={{ fontSize: 40, color: 'var(--text3)', display: 'block', marginBottom: 8 }} aria-hidden="true" />
        <p style={{ color: 'var(--text2)', marginBottom: 16 }}>{error}</p>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/reservas')}>Volver al listado</button>
      </div>
    </div>
  )

  const esPropietario = reserva?.usuarioId === user.id
  const puedeCancelar = reserva?.estado === 'pendiente' && (isAdmin || esPropietario)
  const puedeAprobar  = isAdmin && reserva?.estado === 'pendiente'
  const puedeRechazar = isAdmin && reserva?.estado === 'pendiente'
  const puedeEditar   = reserva?.estado === 'pendiente' && (isAdmin || esPropietario)

  return (
    <div className="page-narrow">
      <BtnVolver to="/reservas" />

      <div className="row" style={{ marginBottom: '1rem', flexWrap: 'wrap', gap: 8 }}>
        <h2 style={{ fontWeight: 600, fontSize: 20 }}>Reserva #{id}</h2>
        {reserva && <BadgeEstado estado={reserva.estado} />}
      </div>

      {error && <ErrorMsg style={{ marginBottom: 12 }}>{error}</ErrorMsg>}

      {/* Datos */}
      {reserva && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <div className="grid-2" style={{ gap: '1rem' }}>
            <div>
              <label>Aula</label>
              <p style={{ fontWeight: 500 }}>{aula?.nombre ?? `Aula #${reserva.aulaId}`}</p>
              {aula?.ubicacion && <p style={{ fontSize: 13, color: 'var(--text2)' }}>{aula.ubicacion}</p>}
            </div>
            <div>
              <label>Fecha</label>
              <p style={{ fontWeight: 500 }}>{reserva.fecha}</p>
            </div>
            <div>
              <label>Horario</label>
              <p style={{ fontWeight: 500 }}>{reserva.horaInicio} – {reserva.horaFin}</p>
            </div>
            <div>
              <label>Personas</label>
              <p style={{ fontWeight: 500 }}>{reserva.cantidadPersonas}
                {aula && <span style={{ fontWeight: 400, color: 'var(--text2)', fontSize: 13 }}> / {aula.capacidad} máx.</span>}
              </p>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label>Motivo</label>
              <p>{reserva.motivo}</p>
            </div>
            {aula?.recursos?.length > 0 && (
              <div style={{ gridColumn: '1 / -1' }}>
                <label>Recursos del aula</label>
                <p style={{ fontSize: 13, color: 'var(--text2)' }}>{aula.recursos.join(', ')}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Acciones */}
      <div className="row" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: 8 }}>
        {puedeEditar && (
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/reservas/${id}/editar`)} disabled={accionando}>
            <i className="ti ti-edit" aria-hidden="true" /> Editar
          </button>
        )}
        {puedeAprobar && (
          <button className="btn btn-success btn-sm" disabled={accionando} onClick={() => accion(() => reservasAPI.aprobar(id))}>
            <i className="ti ti-check" aria-hidden="true" /> Aprobar
          </button>
        )}
        {puedeRechazar && (
          <button className="btn btn-danger btn-sm" disabled={accionando} onClick={() => accion(() => reservasAPI.rechazar(id))}>
            <i className="ti ti-x" aria-hidden="true" /> Rechazar
          </button>
        )}
        {puedeCancelar && (
          <button className="btn btn-outline-danger btn-sm" disabled={accionando} onClick={() => accion(() => reservasAPI.cancelar(id))}>
            <i className="ti ti-ban" aria-hidden="true" /> Cancelar reserva
          </button>
        )}
      </div>

      {/* Historial */}
      <h3 style={{ fontWeight: 500, fontSize: 15, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
        <i className="ti ti-history" style={{ color: 'var(--brand)' }} aria-hidden="true" />
        Historial de actividad
      </h3>

      <div className="card">
        {historial.length === 0 ? (
          <p style={{ color: 'var(--text3)', fontSize: 13 }}>Sin actividad registrada</p>
        ) : (
          <ol style={{ listStyle: 'none', display: 'flex', flexDirection: 'column' }}>
            {historial.map((h, i) => (
              <li
                key={h.id}
                style={{
                  display: 'flex', gap: 12,
                  paddingBottom: i < historial.length - 1 ? 12 : 0,
                  marginBottom:  i < historial.length - 1 ? 12 : 0,
                  borderBottom:  i < historial.length - 1 ? '1px solid var(--border)' : 'none',
                }}
              >
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--brand)', marginTop: 6, flexShrink: 0 }} />
                <div>
                  <p style={{ fontWeight: 500, fontSize: 14 }}>
                    {LABEL_ACCION[h.accion] ?? h.accion}
                  </p>
                  {h.valorNuevo?.estado && (
                    <p style={{ fontSize: 12, color: 'var(--text2)' }}>
                      Estado: <strong>{h.valorAnterior?.estado ?? '—'}</strong> → <strong>{h.valorNuevo.estado}</strong>
                    </p>
                  )}
                  <p style={{ fontSize: 12, color: 'var(--text3)' }}>
                    {new Date(h.fechaHora).toLocaleString('es-AR')}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  )
}
