import serverless from 'serverless-http';
import app from './app.js';
import { initializeDatabase } from './db/sequelize.js';

let ready = false;

async function ensureReady() {
  if (!ready) {
    await initializeDatabase();
    ready = true;
  }
}

export const handler = async (event, context) => {
  await ensureReady();
  const h = serverless(app);
  return h(event, context);
};

