import { Sequelize } from 'sequelize';
import 'mysql2';
import mysql from 'mysql2/promise';
import config from '../config/index.js';

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

  try {
    // Create database if it doesn't exist (except in production)
    if (config.env !== 'production') {
      const connection = await mysql.createConnection({ host, port, user, password });
      await connection.query(
        `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
      );
      await connection.end();
    }

    await sequelize.authenticate();

    // // sync in development to ensure all tables are created
    // if (config.env !== 'production') {
    //   await sequelize.sync({ force: true });
    // } else {
    //   await sequelize.sync({ alter: true });
    // }

    initialized = true;
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}
