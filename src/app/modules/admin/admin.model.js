import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import config from '../../../config/index.js';

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ['admin', 'super_admin'],
      default: 'admin',
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.password;
        return ret;
      },
    },
  }
);

// Hash password before saving
adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, Number(config.bcrypt_salt_rounds));
  next();
});

// Check if password matches
adminSchema.methods.isPasswordMatched = async function (givenPassword) {
  return await bcrypt.compare(givenPassword, this.password);
};

export const Admin = mongoose.model('Admin', adminSchema);