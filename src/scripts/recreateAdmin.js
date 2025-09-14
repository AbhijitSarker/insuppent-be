import { Admin } from '../app/modules/admin/admin.model.js';
import { sequelize } from '../db/sequelize.js';
import bcrypt from 'bcrypt';

const recreateAdminUser = async () => {
  try {
    await sequelize.authenticate();

    // Delete existing admin user if exists
    await Admin.destroy({
      where: {
        email: 'admin@example.com'
      }
    });
    
    // Create new admin - password will be hashed by model hooks
    const admin = await Admin.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
      status: 'active'
    });

    // Get admin with password for verification
    const adminWithPassword = await Admin.findOne({
      where: { email: 'admin@example.com' },
      attributes: { include: ['password'] }
    });

    // Verify password
    const isPasswordValid = await adminWithPassword.isPasswordMatched('admin123');
    
    if (!isPasswordValid) {
      const plainPassword = 'admin123';
      const manualCheck = await bcrypt.compare(plainPassword, adminWithPassword.password);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

recreateAdminUser();
