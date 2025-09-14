import LeadMembershipMaxSaleCount from '../app/modules/lead/leadTypeMaxSaleCount.model.js';
import { sequelize } from '../db/sequelize.js';
import bcrypt from 'bcrypt';

const seedLeadMembershipMaxSaleCounts = async () => {
  try {
    await sequelize.authenticate();
    
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
      await LeadMembershipMaxSaleCount.create({
          id: 1,
          membership: 'Subscriber',
          maxLeadSaleCount: 50
      });

      await LeadMembershipMaxSaleCount.create({
          id: 2,
          membership: 'Startup',
          maxLeadSaleCount: 80
      });

      await LeadMembershipMaxSaleCount.create({
          id: 3,
          membership: 'Agency',
          maxLeadSaleCount: 100
      });

      console.log('memberships created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

seedLeadMembershipMaxSaleCounts();
