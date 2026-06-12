/* ── Estados y constantes de dominio ────────────────────────────────── */

export const ESTADOS = {
  pendiente:  'pendiente',
  aprobada:   'aprobada',
  rechazada:  'rechazada',
  cancelada:  'cancelada',
}

/* ── apiFetch ────────────────────────────────────────────────────────── */

export async function apiFetch(path, opts = {}) {
  const token = localStorage.getItem('token')
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(opts.headers || {}),
  }

  const res = await fetch(path, { ...opts, headers })
  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    const err = new Error(data.mensaje || 'Error del servidor')
    err.status = res.status
    throw err
  }

  return data
}

/* ── Auth ────────────────────────────────────────────────────────────── */

export const authAPI = {
  login:    (body) => apiFetch('/api/auth/login',    { method: 'POST', body: JSON.stringify(body) }),
  register: (body) => apiFetch('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
}

/* ── Aulas ───────────────────────────────────────────────────────────── */

export const aulasAPI = {
  getAll:      ()       => apiFetch('/api/aulas'),
  getById:     (id)     => apiFetch(`/api/aulas/${id}`),
  create:      (body)   => apiFetch('/api/aulas',              { method: 'POST',  body: JSON.stringify(body) }),
  update:      (id, b)  => apiFetch(`/api/aulas/${id}`,        { method: 'PUT',   body: JSON.stringify(b) }),
  activar:     (id)     => apiFetch(`/api/aulas/${id}/activar`,    { method: 'PATCH' }),
  desactivar:  (id)     => apiFetch(`/api/aulas/${id}/desactivar`, { method: 'PATCH' }),
}

/* ── Reservas ────────────────────────────────────────────────────────── */

export const reservasAPI = {
  // GET /api/reservas?fecha=&estado=&aulaId=&q=&page=&limit=&sortBy=&order=
  getAll: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null))
    ).toString()
    return apiFetch(`/api/reservas${qs ? `?${qs}` : ''}`)
  },

  getById:  (id)        => apiFetch(`/api/reservas/${id}`),
  resumen:  ()          => apiFetch('/api/reservas/resumen'),

  create:   (body)      => apiFetch('/api/reservas',           { method: 'POST',  body: JSON.stringify(body) }),
  update:   (id, body)  => apiFetch(`/api/reservas/${id}`,     { method: 'PUT',   body: JSON.stringify(body) }),

  cancelar: (id)        => apiFetch(`/api/reservas/${id}/cancelar`, { method: 'PATCH' }),
  aprobar:  (id)        => apiFetch(`/api/reservas/${id}/aprobar`,  { method: 'PATCH' }),
  rechazar: (id)        => apiFetch(`/api/reservas/${id}/rechazar`, { method: 'PATCH' }),

  historial: (id)       => apiFetch(`/api/reservas/${id}/historial`),
}
