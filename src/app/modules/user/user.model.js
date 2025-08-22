import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../../db/sequelize.js';

import { LeadUser } from '../purchase/leadUser.model.js';
export class User extends Model {}

User.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      allowNull: false,
      defaultValue: 'active',
    },
    subscription: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'User',
    timestamps: true,
  },
);

// Association for purchase history
User.hasMany(LeadUser, { foreignKey: 'userId' });
