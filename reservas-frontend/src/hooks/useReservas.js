import { useState, useCallback } from 'react'
import { reservasService } from '../services/reservasService'

export function useReservas() {
  const [reservas, setReservas] = useState([])
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 1
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const cargar = useCallback(async (filtros = {}) => {
    setLoading(true)
    setError(null)

    try {
      const data = await reservasService.listar(filtros)

      console.log('RESPUESTA BACKEND:', data)

      if (Array.isArray(data)) {
        setReservas(data)

        setPagination({
          page: 1,
          total: data.length,
          totalPages: 1
        })
      } else {
        setReservas(data.datos || [])

        setPagination({
          page: data.page || 1,
          total: data.total || 0,
          totalPages: Math.ceil(
            (data.total || 0) /
            (data.limit || 10)
          )
        })
      }
    } catch (err) {
      console.error('ERROR RESERVAS:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    reservas,
    pagination,
    loading,
    error,
    cargar
  }
}