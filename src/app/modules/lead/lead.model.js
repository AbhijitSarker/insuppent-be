import { Schema, model } from 'mongoose';

const leadSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  zipCode: {
    type: String,
    trim: true,
  },
  state: {
    type: String,
    trim: true,
  },
  type: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['public', 'private'],
    default: 'public'
  },
  saleCount: {
    type: Number,
    default: 0
  },
  maxLeadSaleCount: {
    type: Number,
    default: 3
  },
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
  },
});

export const Lead = model('Lead', leadSchema);