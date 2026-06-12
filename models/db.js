import { Sequelize } from 'sequelize';

// Usá SQLite para desarrollo (sin servidor). Cambiá a postgres/mysql en producción:
// new Sequelize('postgres://user:pass@localhost:5432/aulas')
export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: '../data/database.sqlite',
  logging: false
});
