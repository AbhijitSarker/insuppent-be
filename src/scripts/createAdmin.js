import { Admin } from '../app/modules/admin/admin.model.js';
import { sequelize } from '../db/sequelize.js';
import bcrypt from 'bcrypt';

const createAdminUser = async () => {
  try {
    await sequelize.authenticate();
    
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    await Admin.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
      status: 'active'
    });

    console.log('Admin user created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdminUser();
