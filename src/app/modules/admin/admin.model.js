import bcrypt from 'bcrypt';
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../../db/sequelize.js';
import config from '../../../config/index.js';

export class Admin extends Model {
  async isPasswordMatched(givenPassword) {
    return bcrypt.compare(givenPassword, this.password);
  }
}

Admin.init(
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
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('admin', 'super_admin'),
      allowNull: false,
      defaultValue: 'admin',
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      allowNull: false,
      defaultValue: 'active',
    },
  },
  {
    sequelize,
    modelName: 'Admin',
    tableName: 'Admin',
    timestamps: true,
    defaultScope: {
      attributes: { exclude: ['password'] },
    },
    hooks: {
      beforeCreate: async admin => {
        if (admin.password) {
          admin.password = await bcrypt.hash(
            admin.password,
            Number(config.bcrypt_salt_rounds),
          );
        }
      },
      beforeUpdate: async admin => {
        if (admin.changed('password')) {
          admin.password = await bcrypt.hash(
            admin.password,
            Number(config.bcrypt_salt_rounds),
          );
        }
      },
    },
  },
);
