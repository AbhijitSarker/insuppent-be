import { parsePayload } from '../../../helpers/parsePayload.js';
import { Lead } from './lead.model.js';

const processWebhookData = async (payload) => {
  const body = parsePayload(payload);

  const leadData = {
    zipCode: body['Zip Code']?.trim(),
    firstName: body['First Name']?.trim(),
    lastName: body['Last Name']?.trim(),
    email: body['Email']?.toLowerCase().trim(),
    phone: body['Phone']?.replace(/\D/g, ''), // Remove non-numeric characters
    address: (body['Street Address'] || body['Full Street Address'])?.trim(),
    type: body['form_name']?.trim(),
  };

  const lead = await Lead.create(leadData);

  return lead;
};

export const LeadService = {
  processWebhookData
};
