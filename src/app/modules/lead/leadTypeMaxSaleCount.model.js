import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../../db/sequelize.js';

export class LeadMembershipMaxSaleCount extends Model {}

LeadMembershipMaxSaleCount.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    membership: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    maxLeadSaleCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 3,
    },
  },
  {
    sequelize,
    modelName: 'LeadMembershipMaxSaleCount',
    tableName: 'LeadMembershipMaxSaleCount',
    timestamps: false,
  },
);

export default LeadMembershipMaxSaleCount;
