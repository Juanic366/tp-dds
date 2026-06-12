import api from './api'

export const aulasService = {
  async listar() {
    const { data } = await api.get('/aulas')
    return data
  },
}
