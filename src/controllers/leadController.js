import * as leadService from '../services/leadService.js';
import { asyncHandler } from '../utils/helpers.js';

export const webhookHandler = asyncHandler(async (req, res) => {
    console.log("req.body",req.body);
    
    const lead = await leadService.processWebhookData(req.body);
    res.status(201).json({
        status: 'success',
        data: lead
    });
});

export const getLeads = asyncHandler(async (req, res) => {
    const leads = await leadService.getAllLeads(req.query);
    res.status(200).json({
        status: 'success',
        data: leads
    });
});

export const getLead = asyncHandler(async (req, res) => {
    const lead = await leadService.getLeadById(req.params.id);
    res.status(200).json({
        status: 'success',
        data: lead
    });
});

export const updateLead = asyncHandler(async (req, res) => {
    const lead = await leadService.updateLead(req.params.id, req.body);
    res.status(200).json({
        status: 'success',
        data: lead
    });
});