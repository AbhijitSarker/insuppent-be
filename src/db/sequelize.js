import { Sequelize } from 'sequelize';
import 'mysql2';
import mysql from 'mysql2/promise';
import config from '../config/index.js';

// const {
//   host = 'localhost',
//   port = 3306,
//   user = 'root',
//   password = '',
//   database = 'insuppent',
//   logging = false,
// } = config.mysql || {};

const {
  host,
  port,
  user,
  password,
  database,
  logging,
} = config.mysql || {};

export const sequelize = new Sequelize(database, user, password, {
  host,
  port,
  dialect: 'mysql',
  logging,
  define: {
    underscored: false,
    freezeTableName: true,
  },
});

let initialized = false;
export async function initializeDatabase() {
  if (initialized) return;

  // TEMP: Allow sync in production to create tables if missing. Remove after first run!
  if (config.env !== 'production') {
    const connection = await mysql.createConnection({ host, port, user, password });
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    await connection.end();
  }

  await sequelize.authenticate();
  // --- REMOVE THIS BLOCK AFTER TABLES ARE CREATED IN PRODUCTION ---
  await sequelize.sync({ alter: true });
  // --------------------------------------------------------------
  initialized = true;
}
