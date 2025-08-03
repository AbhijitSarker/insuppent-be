import { parsePayload } from '../../../helpers/parsePayload.js';
import { Lead } from './lead.model.js';

const processWebhookData = async (payload) => {
  const body = parsePayload(payload);

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

  const lead = await Lead.create(leadData);

  return lead;
};

export const LeadService = {
  processWebhookData
};
