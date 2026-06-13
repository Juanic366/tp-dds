import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { BtnVolver, ErrorMsg, Spinner } from '../components/Ui'
import { aulasAPI, reservasAPI } from '../lib/api'

// Hoy en formato YYYY-MM-DD
function hoy() {
  return new Date().toISOString().split('T')[0]
}

export default function FormReserva() {
  const { id } = useParams()       // undefined → alta; número → edición
  const editando = !!id
  const { user } = useAuth()
  const navigate = useNavigate()

  const [aulas,   setAulas]   = useState([])
  const [loadingInit, setLoadingInit] = useState(true)

  const [form, setForm] = useState({
    aulaId: '', fecha: '', horaInicio: '', horaFin: '',
    cantidadPersonas: '', motivo: '',
  })
  const [error,   setError]   = useState('')
  const [confirm, setConfirm] = useState(false)
  const [saving,  setSaving]  = useState(false)

  // Carga inicial: aulas + datos de la reserva si es edición
  useEffect(() => {
    const init = async () => {
      try {
        const listaAulas = await aulasAPI.getAll()
        // solo aulas activas para reservar
        setAulas(listaAulas.filter((a) => a.activa))

        if (editando) {
          const r = await reservasAPI.getById(id)
          setForm({
            aulaId:           String(r.aulaId),
            fecha:            r.fecha,
            horaInicio:       r.horaInicio,
            horaFin:          r.horaFin,
            cantidadPersonas: String(r.cantidadPersonas),
            motivo:           r.motivo,
          })
        }
      } catch (e) {
        setError(e.message)
      } finally {
        setLoadingInit(false)
      }
    }
    init()
  }, [id, editando])

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }))
  const aula = aulas.find((a) => a.id === Number(form.aulaId))

  const validar = () => {
    if (!form.aulaId)             return 'Seleccioná un aula'
    if (!form.fecha)              return 'Ingresá la fecha'
    if (!form.horaInicio)         return 'Ingresá la hora de inicio'
    if (!form.horaFin)            return 'Ingresá la hora de fin'
    if (form.horaInicio >= form.horaFin) return 'La hora de inicio debe ser menor a la de fin'
    if (form.horaInicio < '08:00' || form.horaFin > '22:00')
      return 'Las reservas solo se permiten entre 08:00 y 22:00'
    if (!form.cantidadPersonas || Number(form.cantidadPersonas) < 1)
      return 'Ingresá la cantidad de personas'
    if (aula && Number(form.cantidadPersonas) > aula.capacidad)
      return `El aula tiene capacidad para ${aula.capacidad} personas`
    if (!form.motivo.trim() || form.motivo.trim().length < 3)
      return 'El motivo debe tener al menos 3 caracteres'
    return null
  }

  const handleSiguiente = (e) => {
    e.preventDefault()
    const err = validar()
    if (err) { setError(err); return }
    setError('')
    setConfirm(true)
  }

  const handleGuardar = async () => {
    setSaving(true)
    setError('')
    try {
      const body = {
        aulaId:           Number(form.aulaId),
        fecha:            form.fecha,
        horaInicio:       form.horaInicio,
        horaFin:          form.horaFin,
        cantidadPersonas: Number(form.cantidadPersonas),
        motivo:           form.motivo.trim(),
      }

      if (editando) {
        await reservasAPI.update(id, body)
        navigate(`/reservas/${id}`)
      } else {
        const nueva = await reservasAPI.create(body)
        navigate(`/reservas/${nueva.id}`)
      }
    } catch (e) {
      setError(e.message)
      setConfirm(false)
    } finally {
      setSaving(false)
    }
  }

  if (loadingInit) return <div className="page-narrow"><Spinner /></div>

  /* ── Pantalla de confirmación ──────────────────────────────────────── */
  if (confirm) {
    const filas = [
      ['Aula',       aula?.nombre ?? `#${form.aulaId}`],
      ['Fecha',      form.fecha],
      ['Horario',    `${form.horaInicio} – ${form.horaFin}`],
      ['Personas',   form.cantidadPersonas],
      ['Motivo',     form.motivo],
    ]
    return (
      <div className="page-narrow">
        <div className="card" style={{ marginTop: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <i className="ti ti-calendar-check" style={{ fontSize: 40, color: 'var(--brand)', display: 'block', marginBottom: 8 }} aria-hidden="true" />
            <h3 style={{ fontWeight: 600, fontSize: 18 }}>
              {editando ? 'Confirmá los cambios' : 'Confirmá la reserva'}
            </h3>
          </div>

          <div style={{ background: 'var(--bg)', borderRadius: 8, padding: '1rem', marginBottom: '1.25rem', fontSize: 14 }}>
            {filas.map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text2)' }}>{k}</span>
                <span style={{ fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>

          <ErrorMsg>{error}</ErrorMsg>

          <div className="row" style={{ gap: 8, marginTop: error ? 12 : 0 }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setConfirm(false)} disabled={saving}>
              Volver a editar
            </button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleGuardar} disabled={saving}>
              {saving ? 'Guardando...' : editando ? 'Guardar cambios' : 'Confirmar reserva'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  /* ── Formulario ────────────────────────────────────────────────────── */
  return (
    <div className="page-narrow">
      <BtnVolver to="/reservas" />

      <h2 style={{ fontWeight: 600, fontSize: 20, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
        <i className={`ti ti-${editando ? 'edit' : 'plus'}`} style={{ color: 'var(--brand)' }} aria-hidden="true" />
        {editando ? 'Editar reserva' : 'Nueva reserva'}
      </h2>

      <form className="card" onSubmit={handleSiguiente} noValidate>
        <div className="field">
          <label htmlFor="aula">Aula</label>
          <select id="aula" value={form.aulaId} onChange={set('aulaId')}>
            <option value="">Seleccioná un aula...</option>
            {aulas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nombre} — {a.ubicacion} (cap. {a.capacidad})
              </option>
            ))}
          </select>
          {aula?.recursos?.length > 0 && (
            <p style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>
              Recursos: {aula.recursos.join(', ')}
            </p>
          )}
        </div>

        <div className="field">
          <label htmlFor="fecha">Fecha</label>
          <input id="fecha" type="date" min={hoy()} value={form.fecha} onChange={set('fecha')} />
        </div>

        <div className="grid-2">
          <div className="field">
            <label htmlFor="horaInicio">Hora de inicio</label>
            <input id="horaInicio" type="time" min="08:00" max="21:59" step="1800" value={form.horaInicio} onChange={set('horaInicio')} />
          </div>
          <div className="field">
            <label htmlFor="horaFin">Hora de fin</label>
            <input id="horaFin" type="time" min="08:01" max="22:00" step="1800" value={form.horaFin} onChange={set('horaFin')} />
          </div>
        </div>

        <div className="field">
          <label htmlFor="personas">
            Cantidad de personas{aula ? ` (máx. ${aula.capacidad})` : ''}
          </label>
          <input
            id="personas"
            type="number"
            min={1}
            max={aula?.capacidad ?? 9999}
            placeholder="¿Cuántas personas?"
            value={form.cantidadPersonas}
            onChange={set('cantidadPersonas')}
          />
        </div>

        <div className="field">
          <label htmlFor="motivo">Motivo de la reserva</label>
          <textarea
            id="motivo"
            rows={3}
            placeholder="Describí para qué necesitás el aula..."
            value={form.motivo}
            onChange={set('motivo')}
          />
        </div>

        <ErrorMsg>{error}</ErrorMsg>

        <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: error ? 12 : 0 }}>
          Revisar y confirmar <i className="ti ti-arrow-right" aria-hidden="true" />
        </button>
      </form>
    </div>
  )
}
