import { DataTypes } from 'sequelize';
import { sequelize } from '../../../db/sequelize.js';

export const LeadUser = sequelize.define('LeadUser', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  leadId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  purchasedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  stripeSessionId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  leadStatus: {
    type: DataTypes.ENUM('Purchased', 'Contacted', 'In Discussion', 'No Response', 'Sold'),
    allowNull: false,
    defaultValue: 'Purchased',
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  isRefunded: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
}, {
  indexes: [
    { unique: true, fields: ['userId', 'leadId'] },
  ],
  timestamps: false,
  tableName: 'LeadUsers',
});
