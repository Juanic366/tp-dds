import * as store from '../models/Reserva.js';
import * as aulasStore from '../models/Aula.js';
import * as historial from '../models/Historial.js';

const HORA_MIN = '08:00';
const HORA_MAX = '22:00';

function esAdmin(usuario) {
  return usuario.roles?.includes("admin");
}

function lanzarError(mensaje, status) {
  const e = new Error(mensaje);
  e.status = status;
  throw e;
}

function validarCampos(data) {
  if (!data.aulaId) lanzarError('El aulaId es requerido', 400);
  if (!data.fecha) lanzarError('La fecha es requerida', 400);
  if (!data.horaInicio) lanzarError('La hora de inicio es requerida', 400);
  if (!data.horaFin) lanzarError('La hora de fin es requerida', 400);

  if (!data.cantidadPersonas || Number(data.cantidadPersonas) <= 0) {
    lanzarError('La cantidad de personas debe ser mayor a cero', 400);
  }

  if (!data.motivo || String(data.motivo).trim().length < 3) {
    lanzarError('El motivo es requerido y debe tener al menos 3 caracteres', 400);
  }

  if (data.horaInicio >= data.horaFin) {
    lanzarError('La hora de inicio debe ser menor a la hora de fin', 400);
  }

  if (data.horaInicio < HORA_MIN || data.horaFin > HORA_MAX) {
    lanzarError('Las reservas solo se permiten entre 08:00 y 22:00', 400);
  }
}

async function validarAulaYCapacidad(aulaId, cantidadPersonas) {
  const aula = await aulasStore.findById(aulaId);

  if (!aula) {
    lanzarError('El aula no existe', 404);
  }

  if (!aula.activa) {
    lanzarError('El aula no está activa', 400);
  }

  if (Number(cantidadPersonas) > aula.capacidad) {
    lanzarError(
      `El aula no tiene capacidad suficiente (máximo ${aula.capacidad} personas)`,
      400
    );
  }

  return aula;
}

async function validarSolapamiento(data, idExcluir = null) {
  const hayConflicto = await store.existeReservaEnHorario(data, idExcluir);

  if (hayConflicto) {
    lanzarError(
      'Ya existe una reserva en ese aula, fecha y horario',
      409
    );
  }
}

const transicionesValidas = {
  pendiente: ['aprobada', 'rechazada', 'cancelada'],
  aprobada: ['cancelada'],
  cancelada: [],
  rechazada: []
};

function validarTransicion(estadoActual, estadoNuevo) {
  const permitidos = transicionesValidas[estadoActual] ?? [];

  if (!permitidos.includes(estadoNuevo)) {
    lanzarError(
      `No se puede pasar de "${estadoActual}" a "${estadoNuevo}"`,
      400
    );
  }
}

export async function obtenerTodas(filtros = {}) {
  let resultado = await store.findByFilters(filtros);

  if (filtros.q) {
    const q = String(filtros.q).toLowerCase();

    resultado = resultado.filter(r =>
      r.motivo?.toLowerCase().includes(q)
    );
  }

  const { sortBy = 'createdAt', order = 'asc' } = filtros;

  resultado.sort((a, b) => {
    const va = a[sortBy] ?? '';
    const vb = b[sortBy] ?? '';

    return order === 'desc'
      ? String(vb).localeCompare(String(va))
      : String(va).localeCompare(String(vb));
  });

  const page = Math.max(1, Number(filtros.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(filtros.limit) || 10));
  const total = resultado.length;

  const datos = resultado.slice(
    (page - 1) * limit,
    page * limit
  );

  return { datos, total, page, limit };
}

export async function obtenerPorId(id) {
  const reserva = await store.findById(id);

  if (!reserva) {
    lanzarError('Reserva no encontrada', 404);
  }

  return reserva;
}

export async function crear(data, usuarioId) {
  validarCampos(data);

  await validarAulaYCapacidad(
    data.aulaId,
    data.cantidadPersonas
  );

  await validarSolapamiento(data);

  const nueva = await store.create({
    ...data,
    usuarioId,
    estado: 'pendiente'
  });

  await historial.create({
    reservaId: nueva.id,
    usuarioId,
    accion: 'creacion',
    valorAnterior: null,
    valorNuevo: { estado: 'pendiente' }
  });

  return nueva;
}

export async function modificar(id, data, usuario) {
  const reserva = await obtenerPorId(id);

  if (
    !esAdmin(usuario) &&
    reserva.usuarioId !== usuario.id
  ) {
    lanzarError(
      'No tenés permiso para editar esta reserva',
      403
    );
  }

  const datosActualizar =
    esAdmin(usuario)
      ? { ...data }
      : { ...data, estado: reserva.estado };

  const mergedData = {
    ...reserva,
    ...datosActualizar
  };

  validarCampos(mergedData);

  await validarAulaYCapacidad(
    mergedData.aulaId,
    mergedData.cantidadPersonas
  );

  await validarSolapamiento(mergedData, id);

  const actualizada = await store.update(
    id,
    datosActualizar
  );

  await historial.create({
    reservaId: Number(id),
    usuarioId: usuario.id,
    accion: 'edicion',
    valorAnterior: { ...reserva },
    valorNuevo: { ...actualizada }
  });

  return actualizada;
}

export async function cambiarEstado(id, estadoNuevo, usuario) {
  const reserva = await obtenerPorId(id);

  if (estadoNuevo === 'cancelada') {
    if (
      !esAdmin(usuario) &&
      reserva.usuarioId !== usuario.id
    ) {
      lanzarError(
        'Solo podés cancelar tus propias reservas',
        403
      );
    }
  } else {
    if (!esAdmin(usuario)) {
      lanzarError(
        'Solo un administrador puede aprobar o rechazar reservas',
        403
      );
    }
  }

  validarTransicion(
    reserva.estado,
    estadoNuevo
  );

  const actualizada = await store.update(id, {
    estado: estadoNuevo
  });

  const accion =
    estadoNuevo === 'aprobada'
      ? 'aprobacion'
      : estadoNuevo === 'rechazada'
        ? 'rechazo'
        : 'cancelacion';

  await historial.create({
    reservaId: Number(id),
    usuarioId: usuario.id,
    accion,
    valorAnterior: {
      estado: reserva.estado
    },
    valorNuevo: {
      estado: estadoNuevo
    }
  });

  return actualizada;
}

export async function resumen() {
  const todas = await store.findAll();

  const porEstado = {
    pendiente: 0,
    aprobada: 0,
    cancelada: 0,
    rechazada: 0
  };

  const porAula = {};

  for (const r of todas) {
    if (porEstado[r.estado] !== undefined) {
      porEstado[r.estado]++;
    }

    porAula[r.aulaId] =
      (porAula[r.aulaId] ?? 0) + 1;
  }

  const hoy = new Date()
    .toISOString()
    .slice(0, 10);

  const proximas = todas
    .filter(
      r =>
        r.fecha >= hoy &&
        ['pendiente', 'aprobada'].includes(r.estado)
    )
    .sort((a, b) =>
      (a.fecha + a.horaInicio).localeCompare(
        b.fecha + b.horaInicio
      )
    )
    .slice(0, 10);

  return {
    porEstado,
    porAula,
    proximas
  };
}