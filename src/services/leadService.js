import Lead from '../models/Lead.js';
import { AppError } from '../utils/helpers.js';
import { STATUS_CODES } from '../utils/constants.js';

const parseRequestBody = (body) => {
    // If body is coming as stringified JSON as a key (from form-urlencoded)
    if (typeof body === 'object' && Object.keys(body).length === 1) {
        try {
            const key = Object.keys(body)[0];
            return JSON.parse(key);
        } catch (err) {
            console.log('Failed to parse stringified JSON key:', err);
        }
    }
    return body;
};

export const processWebhookData = async (rawBody) => {
    // Parse the body first
    const body = parseRequestBody(rawBody);
    

    // Map form submission data to our schema
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
        formId: body['form_id']
    };

    // Debug mapped data
    console.log('Mapped lead data:', leadData);

    // Validate required fields
    const requiredFields = ['zipCode', 'firstName', 'lastName', 'email', 'phone', 'address', 'formId'];
    const missingFields = requiredFields.filter(field => !leadData[field]);
    
    if (missingFields.length > 0) {
        console.log('Missing fields:', missingFields);
        throw new AppError(`Missing required fields: ${missingFields.join(', ')}`, STATUS_CODES.BAD_REQUEST);
    }

    // Create new lead
    const lead = await Lead.create(leadData);
    return lead;
};

export const getAllLeads = async (query = {}) => {
    return await Lead.find(query).sort({ dateAdded: -1 });
};

export const getLeadById = async (id) => {
    const lead = await Lead.findById(id);
    if (!lead) {
        throw new AppError('Lead not found', STATUS_CODES.NOT_FOUND);
    }
    return lead;
};

export const updateLead = async (id, updateData) => {
    const lead = await Lead.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true
    });

    if (!lead) {
        throw new AppError('Lead not found', STATUS_CODES.NOT_FOUND);
    }

    return lead;
};
