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

const getSingleLead = async (id) => {
  const result = await Lead.findById(id).lean();

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, LEAD_MESSAGES.NOT_FOUND);
  }

  return result;
};

const getAllLeads = async (filters, paginationOptions) => {
  const { limit, page, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(paginationOptions);

  const { searchTerm, ...filtersData } = filters;
  const andConditions = [];

  // Handle search term
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

  // Handle filters
  Object.entries(filtersData).forEach(([field, value]) => {
    if (!value || value === '__ALL__') return;

    // Normalize state filter
    if (field === 'state') {
      value = value.toUpperCase().trim();
      console.log('State filter value (getAllLeads):', value);
    }

    if (value.includes(',')) {
      const values = value
        .split(',')
        .map(v => v.trim().toUpperCase())
        .filter(v => v !== '__ALL__');
      if (values.length > 0) {
        // Use $or for multiple values of the same field
        andConditions.push({
          $or: values.map(v => ({ [field]: v })),
        });
        console.log(
          'State filter conditions (getAllLeads):',
          values.map(v => ({ [field]: v })),
        );
      }
    } else {
      andConditions.push({
        [field]: value,
      });
      console.log('Single state filter condition (getAllLeads):', {
        [field]: value,
      });
    }
  });

  const sortConditions = {};
  if (sortBy && sortOrder) {
    sortConditions[sortBy] = sortOrder === 'asc' ? 1 : -1;
  }

  const whereConditions =
    andConditions.length > 0 ? { $and: andConditions } : {};

  // If no pagination options are provided, return all data
  if (!paginationOptions || Object.keys(paginationOptions).length === 0) {
    const result = await Lead.find(whereConditions)
      .sort(sortConditions)
      .lean();

    const total = await Lead.countDocuments(whereConditions);

    return {
      meta: {
        page: 1,
        limit: total,
        total,
      },
      data: result,
    };
  }

  // Otherwise, apply pagination
  const result = await Lead.find(whereConditions)
    .sort(sortConditions)
    .skip(skip)
    .limit(limit)
    .lean();

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

  // Handle search term
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

  // Handle filters
  Object.entries(filtersData).forEach(([field, value]) => {
    if (!value || value === '__ALL__') return;

    // Normalize state filter
    if (field === 'state') {
      value = value.toUpperCase().trim();
      console.log('State filter value (findLeads):', value);
    }

    if (value.includes(',')) {
      const values = value.split(',').map(v => v.trim().toUpperCase()).filter(v => v !== '__ALL__');
      if (values.length > 0) {
        // Use $or for multiple values of the same field
        andConditions.push({
          $or: values.map(v => ({ [field]: v }))
        });
        console.log('State filter conditions (findLeads):', values.map(v => ({ [field]: v })));
      }
    } else {
      andConditions.push({ [field]: value });
      console.log('Single state filter condition (findLeads):', { [field]: value });
    }
  });

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

const updateStatus = async (id, status) => {
  const result = await Lead.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );

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
