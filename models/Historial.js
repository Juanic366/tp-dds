import { DataTypes } from 'sequelize';
import { sequelize } from './db.js';

export const Historial = sequelize.define('Historial', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  reservaId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  usuarioId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  accion: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fechaHora: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  valorAnterior: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const raw = this.getDataValue('valorAnterior');
      return raw ? JSON.parse(raw) : null;
    },
    set(val) {
      this.setDataValue('valorAnterior', val !== null ? JSON.stringify(val) : null);
    }
  },
  valorNuevo: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const raw = this.getDataValue('valorNuevo');
      return raw ? JSON.parse(raw) : null;
    },
    set(val) {
      this.setDataValue('valorNuevo', val !== null ? JSON.stringify(val) : null);
    }
  }
}, {
  tableName: 'historial',
  timestamps: false
});

// ── Funciones del store (misma interfaz que antes) ────────────────────────────

export async function findAll() {
  const rows = await Historial.findAll({ order: [['id', 'ASC']] });
  return rows.map(r => r.toJSON());
}

export async function findById(id) {
  const h = await Historial.findByPk(Number(id));
  return h ? h.toJSON() : null;
}

export async function findByReservaId(reservaId) {
  const rows = await Historial.findAll({
    where: { reservaId: Number(reservaId) },
    order: [['fechaHora', 'ASC']]
  });
  return rows.map(r => r.toJSON());
}

export async function create({ reservaId, usuarioId, accion, valorAnterior = null, valorNuevo = null }) {
  const registro = await Historial.create({
    reservaId:     Number(reservaId),
    usuarioId:     String(usuarioId),
    accion,
    fechaHora:     new Date(),
    valorAnterior,
    valorNuevo
  });
  return registro.toJSON();
}
