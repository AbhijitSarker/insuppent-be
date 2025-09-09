import { Admin } from '../app/modules/admin/admin.model.js';
import { sequelize } from '../db/sequelize.js';
import bcrypt from 'bcrypt';

const recreateAdminUser = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to database');

    // Delete existing admin user if exists
    await Admin.destroy({
      where: {
        email: 'admin@example.com'
      }
    });
    console.log('Deleted existing admin if any');
    
    // Create new admin - password will be hashed by model hooks
    const admin = await Admin.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
      status: 'active'
    });

    console.log('Admin user created successfully:', {
      id: admin.id,
      email: admin.email,
      role: admin.role,
      status: admin.status
    });

    // Get admin with password for verification
    const adminWithPassword = await Admin.findOne({
      where: { email: 'admin@example.com' },
      attributes: { include: ['password'] }
    });

    // Verify password
    const isPasswordValid = await adminWithPassword.isPasswordMatched('admin123');
    console.log('Password verification test:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('Password hash:', adminWithPassword.password);
      const plainPassword = 'admin123';
      console.log('Plain password:', plainPassword);
      console.log('Attempting manual verification...');
      const manualCheck = await bcrypt.compare(plainPassword, adminWithPassword.password);
      console.log('Manual bcrypt comparison:', manualCheck);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

recreateAdminUser();
