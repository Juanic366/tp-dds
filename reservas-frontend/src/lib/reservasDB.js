/**
 * Simulación de base de datos de reservas en localStorage.
 * Cuando exista un backend de reservas, reemplazar estas funciones
 * por llamadas a apiFetch('/api/reservas', ...).
 */

function load() {
  try { return JSON.parse(localStorage.getItem('reservas') || '[]') }
  catch { return [] }
}

function save(arr) {
  localStorage.setItem('reservas', JSON.stringify(arr))
}

let _reservas = load()
let _nextId   = _reservas.length ? Math.max(..._reservas.map(r => r.id)) + 1 : 1

export const reservasDB = {

  getAll() {
    return [..._reservas]
  },

  getById(id) {
    return _reservas.find(r => r.id === Number(id)) ?? null
  },

  create(data) {
    const nueva = {
      id: _nextId++,
      ...data,
      estado: 'pendiente',
      creadaEn: new Date().toISOString(),
      historial: [
        { accion: 'Reserva creada', fecha: new Date().toISOString(), usuario: data.solicitanteNombre },
      ],
    }
    _reservas.push(nueva)
    save(_reservas)
    return nueva
  },

  update(id, cambios, accion, usuario) {
    const i = _reservas.findIndex(r => r.id === Number(id))
    if (i < 0) return null
    _reservas[i] = {
      ..._reservas[i],
      ...cambios,
      historial: [
        ..._reservas[i].historial,
        { accion, fecha: new Date().toISOString(), usuario },
      ],
    }
    save(_reservas)
    return _reservas[i]
  },
}
