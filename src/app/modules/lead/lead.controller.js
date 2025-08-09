import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { LeadService } from './lead.service.js';
import { leadFilterableFields, leadSearchableFields } from './lead.constants.js';
import { paginationFields } from '../../../constants/pagination.js';
import pick from '../../../shared/pick.js';
import { LEAD_MESSAGES } from '../../../enums/messages.js';

const webhookHandler = catchAsync(async (req, res) => {
  const payload = req.body;

  await LeadService.processWebhookData(payload);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Webhook processed successfully',
  });
});

const getSingleLead = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await LeadService.getSingleLead(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: LEAD_MESSAGES.FETCH_SINGLE_SUCCESS,
    data: result,
  });
});

const getAllLeads = catchAsync(async (req, res) => {
  const filters = pick(req.query, leadFilterableFields);
  const paginationOptions = pick(req.query, paginationFields);

  const result = await LeadService.getAllLeads(filters, paginationOptions);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: LEAD_MESSAGES.FETCH_ALL_SUCCESS,
    meta: result.meta,
    data: result.data,
  });
});

const findLeads = catchAsync(async (req, res) => {
  const filters = pick(req.query, leadFilterableFields);
  const paginationOptions = pick(req.query, paginationFields);

  const result = await LeadService.findLeads(
    filters,
    paginationOptions,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: LEAD_MESSAGES.FETCH_ALL_SUCCESS,
    meta: result.meta,
    data: result.data,
  });
});

const updateLead = catchAsync(async (req, res) => {
  const id = req.params.id;
  const updatedData = req.body;
  
  const result = await LeadService.updateLead(id, updatedData);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: LEAD_MESSAGES.UPDATE_SUCCESS,
    data: result,
  });
});

const deleteLead = catchAsync(async (req, res) => {
  const id = req.params.id;
  
  const result = await LeadService.deleteLead(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: LEAD_MESSAGES.DELETE_SUCCESS,
    data: result,
  });
});

const updateStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const result = await LeadService.updateStatus(id, status);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Lead status updated successfully',
    data: result,
  });
});

export const LeadController = {
  webhookHandler,
  getSingleLead,
  getAllLeads,
  findLeads,
  updateLead,
  deleteLead,
  updateStatus,
};
