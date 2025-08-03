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

const getAllLeads = catchAsync(async (req, res) => {
  const filters = pick(req.query, leadFilterableFields);
  const paginationOptions = pick(req.query, paginationFields);

  const result = await LeadService.getAllLeads(
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

export const LeadController = {
  webhookHandler,
  getAllLeads,
  findLeads
};
