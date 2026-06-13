import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Empty, ErrorMsg, Spinner } from '../components/Ui'
import { aulasAPI } from '../lib/api'

function AulaModal({ aula, onClose, onSave }) {
  const [form, setForm] = useState({
    nombre:    aula?.nombre    ?? '',
    ubicacion: aula?.ubicacion ?? '',
    capacidad: aula?.capacidad ?? '',
    recursos:  aula?.recursos?.join(', ') ?? '',
    activa:    aula?.activa    ?? true,
  })
  const [error,  setError]  = useState('')
  const [saving, setSaving] = useState(false)

  const set = (k) => (e) =>
    setForm((p) => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const body = {
        nombre:    form.nombre.trim(),
        ubicacion: form.ubicacion.trim(),
        capacidad: Number(form.capacidad),
        recursos:  form.recursos.split(',').map((r) => r.trim()).filter(Boolean),
        activa:    form.activa,
      }
      const result = aula
        ? await aulasAPI.update(aula.id, body)
        : await aulasAPI.create(body)
      onSave(result)
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: 480 }}>
        <div className="row" style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ fontWeight: 600, fontSize: 17 }}>{aula ? 'Editar aula' : 'Nueva aula'}</h3>
          <div className="spacer" />
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            <i className="ti ti-x" aria-hidden="true" />
          </button>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label>Nombre</label>
            <input value={form.nombre} onChange={set('nombre')} required />
          </div>
          <div className="field">
            <label>Ubicación</label>
            <input value={form.ubicacion} onChange={set('ubicacion')} required />
          </div>
          <div className="field">
            <label>Capacidad</label>
            <input type="number" min={1} value={form.capacidad} onChange={set('capacidad')} required />
          </div>
          <div className="field">
            <label>Recursos (separados por coma)</label>
            <input placeholder="Proyector, Pizarra..." value={form.recursos} onChange={set('recursos')} />
          </div>
          <div className="field" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" id="activa" checked={form.activa} onChange={set('activa')} style={{ width: 'auto' }} />
            <label htmlFor="activa" style={{ margin: 0 }}>Activa</label>
          </div>
          <ErrorMsg>{error}</ErrorMsg>
          <div className="row" style={{ gap: 8, marginTop: error ? 12 : 0 }}>
            <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
              {saving ? 'Guardando...' : aula ? 'Guardar cambios' : 'Crear aula'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Aulas() {
  const { isAdmin } = useAuth()
  const [aulas,   setAulas]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [modal,   setModal]   = useState(null)   // null | 'nueva' | aulaObj

  const cargar = () => {
    setLoading(true)
    aulasAPI.getAll()
      .then(setAulas)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(cargar, [])

  const toggleActiva = async (aula) => {
    try {
      const updated = aula.activa
        ? await aulasAPI.desactivar(aula.id)
        : await aulasAPI.activar(aula.id)
      setAulas((prev) => prev.map((a) => a.id === updated.id ? updated : a))
    } catch (e) {
      setError(e.message)
    }
  }

  const handleSave = (updated) => {
    setAulas((prev) => {
      const existe = prev.find((a) => a.id === updated.id)
      return existe ? prev.map((a) => a.id === updated.id ? updated : a) : [...prev, updated]
    })
    setModal(null)
  }

  return (
    <div className="page">
      <div className="row" style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ fontWeight: 600, fontSize: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <i className="ti ti-building" style={{ color: 'var(--brand)' }} aria-hidden="true" />
          Aulas
        </h2>
        <div className="spacer" />
        {isAdmin && (
          <button className="btn btn-primary btn-sm" onClick={() => setModal('nueva')}>
            <i className="ti ti-plus" aria-hidden="true" /> Nueva aula
          </button>
        )}
      </div>

      <ErrorMsg>{error}</ErrorMsg>

      {loading ? <Spinner /> : aulas.length === 0 ? (
        <Empty icon="ti-building-off" mensaje="No hay aulas registradas" />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {aulas.map((a) => (
            <div key={a.id} className="card" style={{ opacity: a.activa ? 1 : .65 }}>
              <div className="row" style={{ marginBottom: 8 }}>
                <span style={{ fontWeight: 500, flex: 1 }}>{a.nombre}</span>
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: a.activa ? 'var(--success-light)' : '#f3f4f6', color: a.activa ? 'var(--success)' : 'var(--text3)', fontWeight: 500 }}>
                  {a.activa ? 'Activa' : 'Inactiva'}
                </span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 6 }}>
                <i className="ti ti-map-pin" style={{ marginRight: 4 }} aria-hidden="true" />{a.ubicacion}
              </p>
              <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 6 }}>
                <i className="ti ti-users" style={{ marginRight: 4 }} aria-hidden="true" />Cap. {a.capacidad} personas
              </p>
              {a.recursos?.length > 0 && (
                <p style={{ fontSize: 12, color: 'var(--text3)' }}>
                  {a.recursos.join(' · ')}
                </p>
              )}
              {isAdmin && (
                <div className="row" style={{ marginTop: 12, gap: 6 }}>
                  <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => setModal(a)}>
                    <i className="ti ti-edit" aria-hidden="true" /> Editar
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ flex: 1, color: a.activa ? 'var(--danger)' : 'var(--success)', borderColor: a.activa ? 'var(--danger)' : 'var(--success)' }}
                    onClick={() => toggleActiva(a)}
                  >
                    <i className={`ti ti-${a.activa ? 'eye-off' : 'eye'}`} aria-hidden="true" />
                    {a.activa ? ' Desactivar' : ' Activar'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {modal && (
        <AulaModal
          aula={modal === 'nueva' ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
