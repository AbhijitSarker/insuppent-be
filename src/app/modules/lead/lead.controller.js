import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { LeadService } from './lead.service.js';

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
  const result = await LeadService.getAllLeads();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: LEAD_MESSAGES.FETCH_ALL_SUCCESS,
    data: result,
  });
});

const findLeads = catchAsync(async (req, res) => {
  console.log('Finding leads for user:', req.user);
  // Get membership info from req.user (set by auth middleware)
  const memberLevel = req.user?.membership || req.user?.memberLevel || 'Subscriber';
  const userId = req.user?.id;
  const result = await LeadService.findLeads(memberLevel, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: LEAD_MESSAGES.FETCH_ALL_SUCCESS,
    data: result,
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

// Bulk update maxLeadSaleCount for all leads of a given membership
const updateMaxLeadSaleCountByMembership = catchAsync(async (req, res) => {
  const { membership } = req.params;
  const { maxLeadSaleCount } = req.body;
  if (!membership || typeof maxLeadSaleCount !== 'number') {
    return res.status(400).json({ success: false, message: 'membership and maxLeadSaleCount are required.' });
  }
  const result = await LeadService.updateMaxLeadSaleCountByMembership(membership, maxLeadSaleCount);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `maxLeadSaleCount updated for all ${membership} leads`,
    data: result,
  });
});

// Get all lead membership max sale counts
const getAllLeadMembershipMaxSaleCounts = catchAsync(async (req, res) => {
  const result = await LeadService.getAllLeadMembershipMaxSaleCounts();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Fetched all lead membership max sale counts',
    data: result,
  });
});

// Get lead sale counts by membership
const getLeadSaleCountsByMembership = catchAsync(async (req, res) => {
  const result = await LeadService.getLeadSaleCountsByMembership();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Fetched lead sale counts by membership',
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
  updateMaxLeadSaleCountByMembership,
  getAllLeadMembershipMaxSaleCounts,
  getLeadSaleCountsByMembership,
};
