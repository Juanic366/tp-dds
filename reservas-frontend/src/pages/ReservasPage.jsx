import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useReservas } from '../hooks/useReservas'
import { reservasService } from '../services/reservasService'
import { useAuth } from '../context/AuthContext'
import ReservasFilters from '../components/ReservasFilters'
import ReservasTable from '../components/ReservasTable'
import Pagination from '../components/Pagination'
import Alert from '../components/Alert'

const FILTROS_INIT = {
  fecha: '', estado: '', aulaId: '', q: '',
  page: 1, limit: 10, sortBy: 'createdAt', order: 'desc'
}

export default function ReservasPage() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()
  const { reservas, pagination, loading, error, cargar } = useReservas()
  const [filtros, setFiltros] = useState(FILTROS_INIT)
  const [accionError, setAccionError] = useState('')
  const [accionSuccess, setAccionSuccess] = useState('')

  useEffect(() => {
    cargar(filtros)

    console.log("TOKEN", localStorage.getItem("token"))

  }, [filtros, cargar])

  const handleAccion = useCallback(async (accion, id) => {
    setAccionError('')
    setAccionSuccess('')
    try {
      if (accion === 'aprobar') await reservasService.aprobar(id)
      else if (accion === 'rechazar') await reservasService.rechazar(id)
      else if (accion === 'cancelar') await reservasService.cancelar(id)
      setAccionSuccess(`Reserva ${accion === 'aprobar' ? 'aprobada' : accion === 'rechazar' ? 'rechazada' : 'cancelada'} correctamente.`)
      cargar(filtros)
    } catch (err) {
      setAccionError(err.message)
    }
  }, [filtros, cargar])

  console.log('RESERVAS:', reservas)

  return (
    <>
      <div className="page-header">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="page-title">Reservas</h1>
            <p className="page-subtitle">
              {isAdmin ? 'Todas las reservas del sistema' : 'Tus solicitudes de reserva'}
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/reservas/nueva')}>
            ＋ Nueva reserva
          </button>
        </div>
      </div>

      <div className="page-body">
        <Alert type="error" message={accionError} onClose={() => setAccionError('')} />
        <Alert type="success" message={accionSuccess} onClose={() => setAccionSuccess('')} />
        <Alert type="error" message={error} />

        <ReservasFilters
          filtros={filtros}
          onChange={setFiltros}
          onReset={() => setFiltros(FILTROS_INIT)}
        />

        <div className="card" style={{ padding: 0 }}>
          
          <ReservasTable
            reservas={reservas}
            loading={loading}
            onAccion={handleAccion}
          />
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={filtros.limit}
            onChange={page => setFiltros(f => ({ ...f, page }))}
          />
        </div>
      </div>
    </>
  )
}
