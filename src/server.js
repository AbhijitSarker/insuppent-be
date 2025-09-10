import config from './config/index.js';
import app from './app.js';
import { initializeDatabase } from './db/sequelize.js';

// Handle uncaught exceptions
process.on('uncaughtException', error => {
  console.error(error);
  process.exit(1);
});

let server;

async function bootstrap() {
  try {
    // Connect to the MySQL database
    await initializeDatabase();
    console.log('🛢   MySQL database is connected successfully');

    // Create sessions table if it doesn't exist
    const mysql = await import('mysql2/promise');
    const connection = await mysql.createConnection({
      host: config.mysql.host,
      port: config.mysql.port,
      user: config.mysql.user,
      password: config.mysql.password,
      database: config.mysql.database
    });
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS sessions (
        session_id VARCHAR(128) COLLATE utf8mb4_bin NOT NULL,
        expires TIMESTAMP(6) NOT NULL,
        data TEXT COLLATE utf8mb4_bin,
        PRIMARY KEY (session_id)
      ) ENGINE=InnoDB;
    `);
    
    await connection.end();
    
    // Start the server
    server = app.listen(config.port, () => {
      console.log(`Application listening on port ${config.port}`);
    });
  } catch (err) {
    // Log database connection failure
    console.error('Failed to connect database', err);
  }

  // Handle unhandled promise rejections
  process.on('unhandledRejection', error => {
    if (server) {
      server.close(() => {
        if (error instanceof Error) {
          console.error(error.message);
        } else {
          console.error(String(error));
        }
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  });
}

// Initialize the application
bootstrap();
