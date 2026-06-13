import api from './api'

export const authService = {
  async login(email, password) {
    const { data } = await api.post('/auth/login', { email, password })
    return data
  },

  async register(nombre, email, password) {
    const { data } = await api.post('/auth/register', { nombre, email, password })
    return data
  },
}
