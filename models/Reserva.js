import { DataTypes, Op } from 'sequelize';
import { sequelize } from './db.js';

export const Reserva = sequelize.define('Reserva', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  aulaId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  fecha: {
    type: DataTypes.DATEONLY,   // 'YYYY-MM-DD'
    allowNull: false
  },
  horaInicio: {
    type: DataTypes.STRING(5),
    allowNull: false
  },
  horaFin: {
    type: DataTypes.STRING(5),
    allowNull: false
  },
  cantidadPersonas: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  motivo: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: ''
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'aprobada', 'cancelada', 'rechazada'),
    allowNull: false,
    defaultValue: 'pendiente'
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'reservas',
  timestamps: false
});

// ── Funciones del store (misma interfaz que antes) ────────────────────────────

export async function findAll() {
  const rows = await Reserva.findAll({ order: [['id', 'ASC']] });
  return rows.map(r => r.toJSON());
}

export async function findById(id) {
  const r = await Reserva.findByPk(Number(id));
  return r ? r.toJSON() : null;
}

export async function findByFilters({ aulaId, usuarioId, fecha, estado } = {}) {
  const where = {};
  if (aulaId    !== undefined) where.aulaId    = Number(aulaId);
  if (usuarioId !== undefined) where.usuarioId = Number(usuarioId);
  if (fecha)                   where.fecha     = String(fecha);
  if (estado)                  where.estado    = String(estado).toLowerCase();

  const rows = await Reserva.findAll({ where, order: [['id', 'ASC']] });
  return rows.map(r => r.toJSON());
}

export async function create(data) {
  const nueva = await Reserva.create({
    aulaId: Number(data.aulaId),
    usuarioId: Number(data.usuarioId),
    fecha: String(data.fecha),
    horaInicio: String(data.horaInicio),
    horaFin: String(data.horaFin),
    cantidadPersonas: Number(data.cantidadPersonas),
    motivo: data.motivo ? String(data.motivo).trim() : '',
    estado: 'pendiente',
    createdAt: new Date()
  });

  return nueva.get({ plain: true });
}
export async function update(id, data) {
  const reserva = await Reserva.findByPk(Number(id));
  if (!reserva) return null;

  if (data.aulaId           !== undefined) reserva.aulaId           = Number(data.aulaId);
  if (data.fecha            !== undefined) reserva.fecha            = String(data.fecha);
  if (data.horaInicio       !== undefined) reserva.horaInicio       = String(data.horaInicio);
  if (data.horaFin          !== undefined) reserva.horaFin          = String(data.horaFin);
  if (data.cantidadPersonas !== undefined) reserva.cantidadPersonas = Number(data.cantidadPersonas);
  if (data.motivo           !== undefined) reserva.motivo           = String(data.motivo).trim();
  if (data.estado           !== undefined) reserva.estado           = String(data.estado).trim().toLowerCase();

  await reserva.save();
  return reserva.toJSON();
}

export async function existeReservaEnHorario({ aulaId, fecha, horaInicio, horaFin }, idExcluir = null) {
  if (!aulaId || !fecha || !horaInicio || !horaFin) return false;

  const inicio = String(horaInicio).trim();
  const fin    = String(horaFin).trim();

  // Buscamos reservas del mismo aula+fecha con estados activos
  const where = {
    aulaId: Number(aulaId),
    fecha:  String(fecha),
    estado: { [Op.in]: ['pendiente', 'aprobada'] }
  };
  if (idExcluir) where.id = { [Op.ne]: Number(idExcluir) };

  const candidatas = await Reserva.findAll({ where });

  return candidatas.some(r => {
    const rj = r.toJSON();
    // hay solapamiento si NO es que fin <= inicio_otro o inicio >= fin_otro
    return !(fin <= rj.horaInicio || inicio >= rj.horaFin);
  });
}
