import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { LeadService } from './lead.service.js';


const webhookHandler = catchAsync(async (req, res) => {
  const payload = req.body;
  console.log('Received webhook payload:', payload);

  await LeadService.processWebhookData(payload);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Webhook processed successfully',
  });
});


export const LeadController = {
  webhookHandler,
};
