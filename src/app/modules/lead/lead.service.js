import { parsePayload } from '../../../helpers/parsePayload.js';
import { Lead } from './lead.model.js';
// import { getStateFromZipCode } from '../../../helpers/zipCodeHelper.js';
import { LEAD_MESSAGES } from '../../../enums/messages.js';
import ApiError from '../../../errors/ApiError.js';
import httpStatus from 'http-status';
import { Op } from 'sequelize';
import { calculateLeadPrice } from '../../../utils/leadPricing.js';

const processWebhookData = async payload => {
  const body = parsePayload(payload);

  //TODO: Uncomment when zip code processing is needed
  // //find state from zip code
  // const zipCode = body['Zip Code']?.trim();
  // const state = getStateFromZipCode(zipCode);

  const leadData = {
    zipCode: body['Zip Code']?.trim(),
    state: body['State']?.trim(),
    name: `${body['First Name']?.trim()} ${body['Last Name']?.trim()}`.trim(),
    email: body['Email']?.toLowerCase().trim(),
    phone: body['Phone']?.replace(/\D/g, ''), // Remove non-numeric characters
    address: (body['Street Address'] || body['Full Street Address'])?.trim(),
    //assign lead type based on form name
    type: (() => {
      const formName = body['form_name']?.toLowerCase().trim();
      if (formName?.includes('auto')) return 'auto';
      if (formName?.includes('home')) return 'home';
      if (formName?.includes('mortgage')) return 'mortgage';
      return 'other';
    })(),
  };

  return await Lead.create(leadData);
};

const getSingleLead = async id => {
  const result = await Lead.findByPk(id);

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, LEAD_MESSAGES.NOT_FOUND);
  }

  return result;
};

const getAllLeads = async () => {
  const result = await Lead.findAll();
  return result;
};

const findLeads = async (memberLevelFromUser = 'basic') => {
  const result = await Lead.findAll({ where: { status: 'public' } });
  const maskedResult = result.map(lead => {
    const leadObj = lead.toJSON();
    // Use memberLevel from user (middleware), fallback to 'basic'
    const memberLevel = memberLevelFromUser || 'basic';
    const leadType = leadObj.leadType || leadObj.type || 'auto';
    const price = calculateLeadPrice(memberLevel, leadType);
    return {
      ...leadObj,
      email: leadObj.email.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
      phone: leadObj.phone.replace(/(\d{3})(\d+)(\d{2})/, '$1****$3'),
      price,
    };
  });
  return maskedResult;
};

const updateLead = async (id, payload) => {
  await Lead.update(payload, { where: { id } });
  const result = await Lead.findByPk(id);

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, LEAD_MESSAGES.NOT_FOUND);
  }

  return result;
};

const deleteLead = async id => {
  const existing = await Lead.findByPk(id);
  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, LEAD_MESSAGES.NOT_FOUND);
  }
  await Lead.destroy({ where: { id } });
  return existing;
};

const updateStatus = async (id, status) => {
  await Lead.update({ status }, { where: { id } });
  const result = await Lead.findByPk(id);

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Lead not found');
  }

  return result;
};

export const LeadService = {
  processWebhookData,
  getSingleLead,
  getAllLeads,
  findLeads,
  updateLead,
  deleteLead,
  updateStatus,
};
