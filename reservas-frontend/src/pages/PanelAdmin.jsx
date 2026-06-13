import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BadgeEstado, Spinner, ErrorMsg } from '../components/Ui'
import { aulasAPI, reservasAPI } from '../lib/api'

function Metric({ label, value, color = 'var(--text)' }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '1rem', textAlign: 'center' }}>
      <p style={{ fontSize: 28, fontWeight: 700, color }}>{value}</p>
      <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>{label}</p>
    </div>
  )
}

export default function PanelAdmin() {
  const navigate = useNavigate()
  const [resumen,  setResumen]  = useState(null)
  const [aulas,    setAulas]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')

  useEffect(() => {
    Promise.all([reservasAPI.resumen(), aulasAPI.getAll()])
      .then(([r, a]) => { setResumen(r); setAulas(a) })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="page"><Spinner /></div>
  if (error)   return <div className="page"><ErrorMsg>{error}</ErrorMsg></div>

  const { porEstado = {}, porAula = {}, proximas = [] } = resumen

  // Ordenar aulas por cantidad de reservas
  const aulasConUso = aulas
    .map((a) => ({ ...a, count: porAula[a.id] ?? 0 }))
    .sort((a, b) => b.count - a.count)

  const total = Object.values(porEstado).reduce((s, n) => s + n, 0)
  const pct   = (n) => (total ? Math.round((n / total) * 100) : 0)

  return (
    <div className="page">
      <h2 style={{ fontWeight: 600, fontSize: 20, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
        <i className="ti ti-chart-bar" style={{ color: 'var(--brand)' }} aria-hidden="true" />
        Panel administrador
      </h2>

      {/* Métricas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: '1.5rem' }}>
        <Metric label="Total"      value={total}                    />
        <Metric label="Pendientes" value={porEstado.pendiente ?? 0} color="var(--warn)"    />
        <Metric label="Aprobadas"  value={porEstado.aprobada  ?? 0} color="var(--success)" />
        <Metric label="Rechazadas" value={porEstado.rechazada ?? 0} color="var(--danger)"  />
        <Metric label="Canceladas" value={porEstado.cancelada ?? 0} color="var(--text2)"   />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>

        {/* Uso por aula */}
        <div className="card">
          <h3 style={{ fontWeight: 500, fontSize: 15, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
            <i className="ti ti-building" style={{ color: 'var(--brand)' }} aria-hidden="true" />
            Uso por aula
          </h3>
          {aulasConUso.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--text3)' }}>Sin datos</p>
          ) : aulasConUso.map((a) => (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ flex: 1, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {a.nombre}
                {!a.activa && <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 4 }}>(inactiva)</span>}
              </span>
              <div style={{ height: 8, borderRadius: 4, background: 'var(--brand-light)', flex: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct(a.count)}%`, background: a.activa ? 'var(--brand)' : 'var(--text3)', borderRadius: 4, transition: '.3s' }} />
              </div>
              <span style={{ fontSize: 12, color: 'var(--text2)', minWidth: 18, textAlign: 'right' }}>{a.count}</span>
            </div>
          ))}
        </div>

        {/* Próximas reservas */}
        <div className="card">
          <h3 style={{ fontWeight: 500, fontSize: 15, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
            <i className="ti ti-clock" style={{ color: 'var(--warn)' }} aria-hidden="true" />
            Próximas reservas
          </h3>
          {proximas.length === 0 ? (
            <p style={{ color: 'var(--text3)', fontSize: 13 }}>
              <i className="ti ti-circle-check" style={{ marginRight: 6, color: 'var(--success)' }} aria-hidden="true" />
              Sin reservas próximas
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {proximas.map((r) => {
                const aula = aulas.find((a) => a.id === r.aulaId)
                return (
                  <div
                    key={r.id}
                    style={{ padding: '8px 10px', background: 'var(--bg)', borderRadius: 6, cursor: 'pointer', fontSize: 13, transition: '.15s' }}
                    onClick={() => navigate(`/reservas/${r.id}`)}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--brand-light)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg)'}
                  >
                    <div className="row" style={{ marginBottom: 2 }}>
                      <span style={{ fontWeight: 500 }}>{aula?.nombre ?? `Aula #${r.aulaId}`}</span>
                      <BadgeEstado estado={r.estado} />
                    </div>
                    <span style={{ color: 'var(--text2)' }}>{r.fecha} · {r.horaInicio}–{r.horaFin}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Accesos rápidos admin */}
      <div className="card">
        <h3 style={{ fontWeight: 500, fontSize: 15, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <i className="ti ti-settings" style={{ color: 'var(--brand)' }} aria-hidden="true" />
          Acciones rápidas
        </h3>
        <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/reservas?estado=pendiente')}>
            <i className="ti ti-clock" aria-hidden="true" /> Ver pendientes ({porEstado.pendiente ?? 0})
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/aulas')}>
            <i className="ti ti-building" aria-hidden="true" /> Gestionar aulas
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/reservas')}>
            <i className="ti ti-list" aria-hidden="true" /> Ver todas las reservas
          </button>
        </div>
      </div>
    </div>
  )
}
