import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError.js';
import { Lead } from './lead.model.js';


const parseRequestBody = (body) => {
  if (typeof body === 'object' && Object.keys(body).length === 1) {
    try {
      const key = Object.keys(body)[0];
      return JSON.parse(key);
    } catch (error) {
      console.error('Failed to parse stringified JSON key:', error);
    }
  }
  return body;
};

const processWebhookData = async (payload) => {
  const body = parseRequestBody(payload);

  const leadData = {
    zipCode: body['Zip Code'],
    firstName: body['First Name'],
    lastName: body['Last Name'],
    email: body['Email'],
    phone: body['Phone'],
    address: body['Street Address'] || body['Full Street Address'],
    dateAdded: new Date(body['Date']),
    time: body['Time'],
    type: body['form_name'],
  };


  const requiredFields = [
    'zipCode',
    'firstName',
    'lastName',
    'email',
    'phone',
    'address',
  ];
  const missingFields = requiredFields.filter((field) => !leadData[field]);

  if (missingFields.length > 0) {
    console.error('Missing fields:', missingFields);
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Missing required fields: ${missingFields.join(', ')}`
    );
  }

  const lead = await Lead.create(leadData);

  return lead;
};

export const LeadService = {
  processWebhookData
};
