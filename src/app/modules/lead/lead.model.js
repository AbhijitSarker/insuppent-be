import { Schema, model } from 'mongoose';

const leadSchema = new Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
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
    required: true
  },
  dateAdded: {
    type: Date,
    required: true
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
  state: {
    type: String,
    default: ''
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
  timestamps: true
});

export const Lead = model('Lead', leadSchema);