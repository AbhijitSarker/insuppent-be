import bcrypt from 'bcrypt';
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../../db/sequelize.js';
import config from '../../../config/index.js';

export class Admin extends Model {
  async isPasswordMatched(givenPassword) {
    console.log('Comparing passwords...');
    console.log('Given password:', givenPassword);
    console.log('Stored hash:', this.password);
    try {
      // Manual hash for comparison
      const saltRounds = 12;
      const manualHash = await bcrypt.hash(givenPassword, saltRounds);
      console.log('Manual hash of given password:', manualHash);
      
      const result = await bcrypt.compare(givenPassword, this.password);
      console.log('Password comparison result:', result);
      return result;
    } catch (error) {
      console.error('Error comparing passwords:', error);
      return false;
    }
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
    passwordResetToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    passwordResetExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Admin',
    tableName: 'Admin',
    timestamps: true,
    defaultScope: {
      attributes: { exclude: ['password', 'passwordResetToken', 'passwordResetExpires'] },
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
