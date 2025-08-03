import { parsePayload } from '../../../helpers/parsePayload.js';
import { Lead } from './lead.model.js';
import { paginationHelpers } from '../../../helpers/paginationHelper.js';

const processWebhookData = async (payload) => {
  const body = parsePayload(payload);

  const leadData = {
    zipCode: body['Zip Code']?.trim(),
    name: `${body['First Name']?.trim()} ${body['Last Name']?.trim()}`.trim(),
    email: body['Email']?.toLowerCase().trim(),
    phone: body['Phone']?.replace(/\D/g, ''), // Remove non-numeric characters
    address: (body['Street Address'] || body['Full Street Address'])?.trim(),
    type: body['form_name']?.trim(),
  };

  const lead = await Lead.create(leadData);

  return lead;
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
    sortConditions[sortBy] = sortOrder;
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
export const LeadService = {
  processWebhookData,
  getAllLeads
};
