import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../../db/sequelize.js';

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
    subscription: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    purchased: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    refunded: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    status: {
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
