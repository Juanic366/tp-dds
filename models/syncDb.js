// src/models/syncDb.js
// Crea las tablas (si no existen) y siembra datos iniciales la primera vez.

import { sequelize } from './db.js';
import { Aula }      from './Aula.js';
import { Reserva }   from './Reservas.js';
import { Historial } from './Historial.js';

async function seed() {
  // Sólo inserta si las tablas están vacías
  const aulaCount = await Aula.count();
  if (aulaCount === 0) {
    await Aula.bulkCreate([
      { nombre: 'Aula 101',                   ubicacion: 'Edificio Principal - Piso 1', capacidad: 40,  recursos: JSON.stringify(['Proyector','Pizarra digital','Aire acondicionado']),  activa: true  },
      { nombre: 'Laboratorio de Informática A', ubicacion: 'Edificio de Ciencias - Piso 2', capacidad: 25, recursos: JSON.stringify(['Computadoras','Proyector','Internet alta velocidad']), activa: true  },
      { nombre: 'Aula Magna',                 ubicacion: 'Edificio Central - Piso 0',    capacidad: 120, recursos: JSON.stringify(['Proyector','Sonido','Micrófonos inalámbricos']),       activa: true  },
      { nombre: 'Aula 205',                   ubicacion: 'Edificio Possetto - Piso 2',   capacidad: 35,  recursos: JSON.stringify(['Pizarra','Ventiladores']),                             activa: false },
      { nombre: 'Sala de Reuniones B',        ubicacion: 'Edificio de Posgrado - Piso 3', capacidad: 15, recursos: JSON.stringify(['Pantalla','Videoconferencia']),                       activa: true  }
    ]);
  }
}

export async function initDb() {
  // { force: false } → no borra tablas existentes
  await sequelize.sync({ force: false });
  await seed();
  console.log('Base de datos lista (Sequelize + SQLite)');
}
