import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { BadgeEstado, Empty, Spinner, ErrorMsg } from '../components/Ui'
import { ESTADOS, aulasAPI, reservasAPI } from '../lib/api'

export default function ListadoReservas() {
  alert("ListadoReservas cargado")

  const { user, isAdmin } = useAuth()}

export default function ListadoReservas() {
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()

  const [aulas, setAulas] = useState([])
  const [datos, setDatos] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [filtros, setFiltros] = useState({
    fecha: '',
    estado: '',
    aulaId: '',
    q: '',
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    order: 'desc',
  })

  // Carga aulas una sola vez
  useEffect(() => {
    aulasAPI.getAll()
      .then((resp) => {
        console.log('AULAS:', resp)
        setAulas(resp)
      })
      .catch((err) => {
        console.error('ERROR AULAS:', err)
      })
  }, [])

  // Carga reservas cuando cambian filtros
  useEffect(() => {
    console.log('====================')
    console.log('USER:', user)
    console.log('IS ADMIN:', isAdmin)

    setLoading(true)
    setError('')

    const params = { ...filtros }

    if (!isAdmin) {
      params.usuarioId = user.id
    }

    console.log('PARAMS:', params)

    reservasAPI.getAll(params)
      .then((resp) => {
        console.log('RESPUESTA API:', resp)
        console.log('DATOS API:', resp.datos)
        console.log('TOTAL API:', resp.total)

        setDatos(resp.datos)
        setTotal(resp.total)
      })
      .catch((e) => {
        console.error('ERROR API:', e)
        setError(e.message)
      })
      .finally(() => {
        console.log('FIN REQUEST')
        setLoading(false)
      })
  }, [filtros, isAdmin, user.id])

  const sf = (k) => (e) =>
    setFiltros((p) => ({
      ...p,
      [k]: e.target.value,
      page: 1
    }))

  const totalPaginas = Math.ceil(total / filtros.limit)

  console.log('RENDER DATOS:', datos)
  console.log('RENDER TOTAL:', total)
  console.log('RENDER ERROR:', error)
  console.log('RENDER LOADING:', loading)

  return (
    <div className="page">
      <div className="row" style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ fontWeight: 600, fontSize: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <i className="ti ti-calendar" style={{ color: 'var(--brand)' }} aria-hidden="true" />
          Reservas
          {total > 0 && (
            <span style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 400 }}>
              ({total})
            </span>
          )}
        </h2>

        <div className="spacer" />

        <button
          className="btn btn-primary btn-sm"
          onClick={() => navigate('/reservas/nueva')}
        >
          <i className="ti ti-plus" aria-hidden="true" /> Nueva reserva
        </button>
      </div>

      <div
        className="card"
        style={{
          marginBottom: '1rem',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr 1fr',
          gap: 12
        }}
      >
        <div>
          <label>Fecha</label>
          <input
            type="date"
            value={filtros.fecha}
            onChange={sf('fecha')}
          />
        </div>

        <div>
          <label>Estado</label>
          <select value={filtros.estado} onChange={sf('estado')}>
            <option value="">Todos</option>
            {Object.values(ESTADOS).map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Aula</label>
          <select value={filtros.aulaId} onChange={sf('aulaId')}>
            <option value="">Todas</option>
            {aulas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Buscar motivo</label>
          <input
            placeholder="Buscar..."
            value={filtros.q}
            onChange={sf('q')}
          />
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorMsg>{error}</ErrorMsg>
      ) : datos.length === 0 ? (
        <Empty
          icon="ti-calendar-off"
          mensaje="No hay reservas que coincidan con los filtros"
        />
      ) : (
        <>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              marginBottom: '1rem'
            }}
          >
            {datos.map((r) => {
              const aula = aulas.find((a) => a.id === r.aulaId)

              return (
                <Link
                  key={r.id}
                  to={`/reservas/${r.id}`}
                  className="card row"
                  style={{
                    textDecoration: 'none',
                    color: 'inherit',
                    padding: '1rem 1.25rem',
                    transition: '.15s'
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = 'var(--brand)')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.borderColor = 'var(--border)')
                  }
                >
                  <div style={{ flex: 1 }}>
                    <div
                      className="row"
                      style={{
                        marginBottom: 4,
                        flexWrap: 'wrap',
                        gap: 6
                      }}
                    >
                      <span style={{ fontWeight: 500 }}>
                        {aula?.nombre ?? `Aula #${r.aulaId}`}
                      </span>

                      <BadgeEstado estado={r.estado} />
                    </div>

                    <div
                      style={{
                        fontSize: 13,
                        color: 'var(--text2)',
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 12
                      }}
                    >
                      <span>
                        <i className="ti ti-calendar" aria-hidden="true" style={{ marginRight: 3 }} />
                        {r.fecha}
                      </span>

                      <span>
                        <i className="ti ti-clock" aria-hidden="true" style={{ marginRight: 3 }} />
                        {r.horaInicio} – {r.horaFin}
                      </span>

                      <span>
                        <i className="ti ti-users" aria-hidden="true" style={{ marginRight: 3 }} />
                        {r.cantidadPersonas} personas
                      </span>

                      {r.motivo && (
                        <span style={{ fontStyle: 'italic' }}>
                          {r.motivo}
                        </span>
                      )}
                    </div>
                  </div>

                  <i
                    className="ti ti-chevron-right"
                    style={{ color: 'var(--text3)' }}
                    aria-hidden="true"
                  />
                </Link>
              )
            })}
          </div>

          {totalPaginas > 1 && (
            <div className="row" style={{ justifyContent: 'center', gap: 8 }}>
              <button
                className="btn btn-ghost btn-sm"
                disabled={filtros.page <= 1}
                onClick={() =>
                  setFiltros((p) => ({
                    ...p,
                    page: p.page - 1
                  }))
                }
              >
                <i className="ti ti-chevron-left" aria-hidden="true" />
                {' '}Anterior
              </button>

              <span style={{ fontSize: 13, color: 'var(--text2)' }}>
                Página {filtros.page} de {totalPaginas}
              </span>

              <button
                className="btn btn-ghost btn-sm"
                disabled={filtros.page >= totalPaginas}
                onClick={() =>
                  setFiltros((p) => ({
                    ...p,
                    page: p.page + 1
                  }))
                }
              >
                Siguiente{' '}
                <i className="ti ti-chevron-right" aria-hidden="true" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}