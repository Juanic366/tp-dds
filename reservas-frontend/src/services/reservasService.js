import api from './api'

export const reservasService = {
  async listar({
    fecha,
    estado,
    aulaId,
    q,
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    order = 'desc'
  } = {}) {
    const params = {}

    if (fecha) params.fecha = fecha
    if (estado) params.estado = estado
    if (aulaId) params.aulaId = aulaId
    if (q) params.q = q

    params.page = page
    params.limit = limit
    params.sortBy = sortBy
    params.order = order

    const { data } = await api.get('/reservas', { params })

    console.log('LISTAR RESERVAS:', data)

    return data
  },

  async resumen() {
    const { data } = await api.get('/reservas/resumen')
    return data
  },

  async obtener(id) {
    const { data } = await api.get(`/reservas/${id}`)
    return data
  },

  async historial(id) {
    const { data } = await api.get(`/reservas/${id}/historial`)
    return data
  },

  async crear(payload) {
    const { data } = await api.post('/reservas', payload)
    return data
  },

  async editar(id, payload) {
    const { data } = await api.put(`/reservas/${id}`, payload)
    return data
  },

  async cancelar(id) {
    const { data } = await api.patch(`/reservas/${id}/cancelar`)
    return data
  },

  async aprobar(id) {
    const { data } = await api.patch(`/reservas/${id}/aprobar`)
    return data
  },

  async rechazar(id) {
    const { data } = await api.patch(`/reservas/${id}/rechazar`)
    return data
  }
}