import { parsePayload } from '../../../helpers/parsePayload.js';
import { Lead } from './lead.model.js';
import { paginationHelpers } from '../../../helpers/paginationHelper.js';
import { leadSearchableFields } from './lead.constants.js';
import { getStateFromZipCode } from '../../../helpers/zipCodeHelper.js';
import { LEAD_MESSAGES } from '../../../enums/messages.js';
import ApiError from '../../../errors/ApiError.js';
import httpStatus from 'http-status';

const processWebhookData = async (payload) => {
  const body = parsePayload(payload);

  //TODO: Uncomment when zip code processing is needed
  // //find state from zip code
  // const zipCode = body['Zip Code']?.trim();
  // const state = getStateFromZipCode(zipCode);

  const leadData = {
    zipCode: body['Zip Code']?.trim(),
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

const getAllLeads = async (filters, paginationOptions) => {
  const { limit, page, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(paginationOptions);

  const { searchTerm, ...filtersData } = filters;
  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      $or: leadSearchableFields.map(field => ({
        [field]: {
          $regex: searchTerm,
          $options: 'i',
        },
      })),
    });
  }

  if (Object.keys(filtersData).length) {
    andConditions.push({
      $and: Object.entries(filtersData).map(([field, value]) => ({
        [field]: value,
      })),
    });
  }

  const sortConditions = {};
  if (sortBy && sortOrder) {
    sortConditions[sortBy] = sortOrder === 'asc' ? 1 : -1;
  }

  const whereConditions =
  andConditions.length > 0 ? { $and: andConditions } : {};

  const result = await Lead.find(whereConditions)
    .sort(sortConditions)
    .skip(skip)
    .limit(limit);

  const total = await Lead.countDocuments(whereConditions);

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const findLeads = async (filters, paginationOptions) => {
  const { limit, page, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(paginationOptions);

  const { searchTerm, ...filtersData } = filters;
  const andConditions = [{ status: 'public' }]; // Only get public leads

  if (searchTerm) {
    andConditions.push({
      $or: leadSearchableFields.map(field => ({
        [field]: {
          $regex: searchTerm,
          $options: 'i',
        },
      })),
    });
  }

  if (Object.keys(filtersData).length) {
    andConditions.push({
      $and: Object.entries(filtersData).map(([field, value]) => ({
        [field]: value,
      })),
    });
  }

  const sortConditions = {};
  if (sortBy && sortOrder) {
    sortConditions[sortBy] = sortOrder === 'asc' ? 1 : -1;
  }

  const whereConditions = { $and: andConditions };

  const result = await Lead.find(whereConditions)
    .sort(sortConditions)
    .skip(skip)
    .limit(limit)
    .select('-__v')
    .lean();

  // Mask sensitive information
  const maskedResult = result.map(lead => ({
    ...lead,
    email: lead.email.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
    phone: lead.phone.replace(/(\d{3})(\d+)(\d{2})/, '$1****$3'),
  }));

  const total = await Lead.countDocuments(whereConditions);

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: maskedResult,
  };
};


const updateLead = async (id, payload) => {
  const result = await Lead.findOneAndUpdate(
    { _id: id },
    payload,
    {
      new: true,
    },
  )

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, LEAD_MESSAGES.NOT_FOUND);
  }

  return result;
};

const deleteLead = async (id) => {
  const result = await Lead.findByIdAndDelete(id);

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, LEAD_MESSAGES.NOT_FOUND);
  }
  return result;
};

export const LeadService = {
  processWebhookData,
  getAllLeads,
  findLeads,
  updateLead,
  deleteLead,
};
