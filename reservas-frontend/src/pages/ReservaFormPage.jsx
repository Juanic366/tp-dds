import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { reservasService } from '../services/reservasService'
import { aulasService } from '../services/aulasService'
import Alert from '../components/Alert'

const HORA_MIN = '08:00'
const HORA_MAX = '22:00'

const FORM_INIT = {
  aulaId: '',
  fecha: '',
  horaInicio: '',
  horaFin: '',
  cantidadPersonas: '',
  motivo: '',
}

export default function ReservaFormPage() {
  const { id } = useParams()
  const isEditing = Boolean(id)
  const navigate = useNavigate()

  const [form, setForm] = useState(FORM_INIT)
  const [errors, setErrors] = useState({})
  const [aulas, setAulas] = useState([])
  const [aulaSeleccionada, setAulaSeleccionada] = useState(null)
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)

  // Load aulas and existing reserva if editing
  useEffect(() => {
    async function init() {
      setLoadingData(true)
      try {
        const aulasData = await aulasService.listar()
        const listaAulas = Array.isArray(aulasData) ? aulasData : aulasData.aulas || []
        setAulas(listaAulas.filter(a => a.activa))

        if (isEditing) {
          const data = await reservasService.obtener(id)
          const r = data.reserva || data
          setForm({
            aulaId: r.aulaId || r.aula?.id || '',
            fecha: r.fecha || '',
            horaInicio: r.horaInicio || '',
            horaFin: r.horaFin || '',
            cantidadPersonas: String(r.cantidadPersonas || ''),
            motivo: r.motivo || '',
          })
          if (r.aula) setAulaSeleccionada(r.aula)
        }
      } catch (err) {
        setApiError(err.message)
      } finally {
        setLoadingData(false)
      }
    }
    init()
  }, [id, isEditing])

  // Update aulaSeleccionada when aulaId changes
  useEffect(() => {
    if (form.aulaId) {
      const found = aulas.find(a => String(a.id) === String(form.aulaId))
      setAulaSeleccionada(found || null)
    } else {
      setAulaSeleccionada(null)
    }
  }, [form.aulaId, aulas])

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }))
    setErrors(er => ({ ...er, [key]: '' }))
  }

  function validate() {
    const errs = {}
    if (!form.aulaId) errs.aulaId = 'Seleccioná un aula'
    if (!form.fecha) errs.fecha = 'La fecha es requerida'
    if (!form.horaInicio) errs.horaInicio = 'La hora de inicio es requerida'
    else if (form.horaInicio < HORA_MIN || form.horaInicio >= HORA_MAX) {
      errs.horaInicio = `El horario debe estar entre ${HORA_MIN} y ${HORA_MAX}`
    }
    if (!form.horaFin) errs.horaFin = 'La hora de fin es requerida'
    else if (form.horaFin <= form.horaInicio) errs.horaFin = 'La hora de fin debe ser mayor a la de inicio'
    else if (form.horaFin > HORA_MAX) errs.horaFin = `La hora de fin no puede superar las ${HORA_MAX}`

    const personas = parseInt(form.cantidadPersonas)
    if (!form.cantidadPersonas || isNaN(personas) || personas < 1) {
      errs.cantidadPersonas = 'Ingresá una cantidad válida'
    } else if (aulaSeleccionada && personas > aulaSeleccionada.capacidad) {
      errs.cantidadPersonas = `Supera la capacidad del aula (${aulaSeleccionada.capacidad} personas)`
    }
    if (!form.motivo.trim()) errs.motivo = 'El motivo es requerido'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    setApiError('')
    try {
      const payload = {
        ...form,
        cantidadPersonas: parseInt(form.cantidadPersonas),
      }
      if (isEditing) {
        await reservasService.editar(id, payload)
        navigate(`/reservas/${id}`)
      } else {
        const data = await reservasService.crear(payload)
        const nuevaId = data.reserva?.id || data.id
        navigate(nuevaId ? `/reservas/${nuevaId}` : '/reservas')
      }
    } catch (err) {
      setApiError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) return (
    <div className="loading-spinner" style={{ marginTop: '4rem' }}>
      <div className="spinner" />
      <span>Cargando...</span>
    </div>
  )

  return (
    <>
      <div className="page-header">
        <div className="flex items-center gap-3 mb-3">
          <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)}>← Volver</button>
        </div>
        <h1 className="page-title">{isEditing ? 'Editar reserva' : 'Nueva reserva'}</h1>
        <p className="page-subtitle">
          {isEditing ? 'Modificá los datos de la reserva' : 'Completá los datos para solicitar un aula'}
        </p>
      </div>

      <div className="page-body">
        <div style={{ maxWidth: 680 }}>
          <Alert type="error" message={apiError} onClose={() => setApiError('')} />

          <form onSubmit={handleSubmit}>
            {/* Aula */}
            <div className="card mb-4">
              <div className="card-title">Selección de aula</div>
              <div className="form-group">
                <label className="form-label">Aula *</label>
                <select
                  value={form.aulaId}
                  onChange={e => set('aulaId', e.target.value)}
                >
                  <option value="">— Seleccioná un aula —</option>
                  {aulas.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.nombre} · {a.ubicacion} · Capacidad: {a.capacidad}
                    </option>
                  ))}
                </select>
                {errors.aulaId && <span className="form-error">✗ {errors.aulaId}</span>}
              </div>

              {aulaSeleccionada && (
                <div className="alert alert-info" style={{ marginTop: '0.75rem' }}>
                  <span>ℹ</span>
                  <div>
                    <strong>{aulaSeleccionada.nombre}</strong> — {aulaSeleccionada.ubicacion}<br />
                    <span style={{ fontSize: '0.8125rem' }}>
                      Capacidad: {aulaSeleccionada.capacidad} personas
                      {aulaSeleccionada.recursos && ` · Recursos: ${Array.isArray(aulaSeleccionada.recursos) ? aulaSeleccionada.recursos.join(', ') : aulaSeleccionada.recursos}`}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Fecha y horario */}
            <div className="card mb-4">
              <div className="card-title">Fecha y horario</div>
              <div className="form-grid form-grid-3">
                <div className="form-group">
                  <label className="form-label">Fecha *</label>
                  <input
                    type="date"
                    value={form.fecha}
                    onChange={e => set('fecha', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  {errors.fecha && <span className="form-error">✗ {errors.fecha}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Hora inicio *</label>
                  <input
                    type="time"
                    value={form.horaInicio}
                    onChange={e => set('horaInicio', e.target.value)}
                    min={HORA_MIN}
                    max={HORA_MAX}
                  />
                  {errors.horaInicio && <span className="form-error">✗ {errors.horaInicio}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Hora fin *</label>
                  <input
                    type="time"
                    value={form.horaFin}
                    onChange={e => set('horaFin', e.target.value)}
                    min={form.horaInicio || HORA_MIN}
                    max={HORA_MAX}
                  />
                  {errors.horaFin && <span className="form-error">✗ {errors.horaFin}</span>}
                </div>
              </div>
              <div className="alert alert-warning" style={{ marginTop: '0.75rem', fontSize: '0.8125rem' }}>
                ⚠ Las reservas solo se aceptan en horario laboral: {HORA_MIN} a {HORA_MAX}
              </div>
            </div>

            {/* Datos adicionales */}
            <div className="card mb-4">
              <div className="card-title">Detalles</div>
              <div className="form-grid form-grid-2" style={{ marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Cantidad de personas *</label>
                  <input
                    type="number"
                    min="1"
                    max={aulaSeleccionada?.capacidad || 999}
                    placeholder="35"
                    value={form.cantidadPersonas}
                    onChange={e => set('cantidadPersonas', e.target.value)}
                  />
                  {errors.cantidadPersonas && <span className="form-error">✗ {errors.cantidadPersonas}</span>}
                  {aulaSeleccionada && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-faint)' }}>
                      Máximo: {aulaSeleccionada.capacidad}
                    </span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Motivo *</label>
                <textarea
                  rows={3}
                  placeholder="Clase de consulta, reunión de cátedra, examen..."
                  value={form.motivo}
                  onChange={e => set('motivo', e.target.value)}
                />
                {errors.motivo && <span className="form-error">✗ {errors.motivo}</span>}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ minWidth: 160, justifyContent: 'center' }}
              >
                {loading
                  ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Guardando...</>
                  : isEditing ? '✓ Guardar cambios' : '✦ Solicitar reserva'
                }
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
