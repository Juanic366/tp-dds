import { DataTypes } from 'sequelize';
import { sequelize } from './db.js';

export const Aula = sequelize.define('Aula', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  ubicacion: {
    type: DataTypes.STRING,
    allowNull: false
  },
  capacidad: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  recursos: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: '[]',
    get() {
      const raw = this.getDataValue('recursos');
      return typeof raw === 'string' ? JSON.parse(raw) : raw;
    },
    set(val) {
      this.setDataValue('recursos', JSON.stringify(Array.isArray(val) ? val : []));
    }
  },
  activa: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'aulas',
  timestamps: false
});

// ── Funciones del store (misma interfaz que antes) ────────────────────────────

export default Aula;

// export async function findAll() {
//   const rows = await Aula.findAll({ order: [['id', 'ASC']] });
//   return rows.map(r => r.toJSON());
// }

// export async function findById(id) {
//   const aula = await Aula.findByPk(Number(id));
//   return aula ? aula.toJSON() : null;
// }

// export async function findByFilters({ nombre, ubicacion, activa, minCapacidad } = {}) {
//   const todas = await findAll();
//   return todas.filter(aula => {
//     if (nombre && !aula.nombre.toLowerCase().includes(nombre.toLowerCase())) return false;
//     if (ubicacion && !aula.ubicacion.toLowerCase().includes(ubicacion.toLowerCase())) return false;
//     if (activa !== undefined && aula.activa !== activa) return false;
//     if (minCapacidad && aula.capacidad < Number(minCapacidad)) return false;
//     return true;
//   });
// }

// export async function create(data) {
//   const recursos = Array.isArray(data.recursos)
//     ? data.recursos
//     : data.recursos ? String(data.recursos).split(',').map(r => r.trim()) : [];

//   const nueva = await Aula.create({
//     nombre: String(data.nombre).trim(),
//     ubicacion: String(data.ubicacion).trim(),
//     capacidad: Number(data.capacidad),
//     recursos,
//     activa: data.activa !== undefined ? Boolean(data.activa) : true
//   });
//   return nueva.toJSON();
// }

// export async function update(id, data) {
//   const aula = await Aula.findByPk(Number(id));
//   if (!aula) return null;

//   if (data.nombre    !== undefined) aula.nombre    = String(data.nombre).trim();
//   if (data.ubicacion !== undefined) aula.ubicacion = String(data.ubicacion).trim();
//   if (data.capacidad !== undefined) aula.capacidad = Number(data.capacidad);
//   if (data.recursos  !== undefined) {
//     aula.recursos = Array.isArray(data.recursos)
//       ? data.recursos
//       : data.recursos ? String(data.recursos).split(',').map(r => r.trim()) : [];
//   }
//   if (data.activa !== undefined) aula.activa = Boolean(data.activa);

//   await aula.save();
//   return aula.toJSON();
// }

// export async function setActiva(id, valor) {
//   const aula = await Aula.findByPk(Number(id));
//   if (!aula) return null;
//   aula.activa = Boolean(valor);
//   await aula.save();
//   return aula.toJSON();
// }

// export async function existeNombre(nombre, idExcluir = null) {
//   if (!nombre) return false;
//   const n = String(nombre).trim().toLowerCase();
//   const todas = await findAll();
//   return todas.some(aula =>
//     aula.nombre.toLowerCase() === n &&
//     aula.id !== Number(idExcluir)
//   );
// }
