import { initializeDatabase, sequelize } from '../db/sequelize.js';
import { Admin } from '../app/modules/admin/admin.model.js';

async function runSeed() {
  try {
    await initializeDatabase();

    // Seed admin if none exists
    const adminCount = await Admin.count();
    if (adminCount === 0) {
      await Admin.create({
        name: 'Admin User',
        email: 'branton@gmail.com',
        password: 'secret123',
        role: 'admin',
        status: 'active',
      });
    }


    console.log('Seeding complete');
  } catch (err) {
    console.error('Seed failed', err);
  } finally {
    await sequelize.close();
  }
}

runSeed();

