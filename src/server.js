import config from './config/index.js';
import app from './app.js';
import { initializeDatabase } from './db/sequelize.js';
import { ensureLeadPricingFile } from './utils/ensureConfigFiles.js';

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

    // Ensure configuration files exist
    await ensureLeadPricingFile();
    console.log('📄 Configuration files validated');

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
