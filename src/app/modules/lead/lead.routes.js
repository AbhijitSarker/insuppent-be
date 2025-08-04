import express from 'express';
import { LeadController } from './lead.controller.js';
import validateRequest from '../../middlewares/validateRequest.js';
import { LeadValidation } from './lead.validations.js';

const router = express.Router();

router.post(
  '/webhook',
  LeadController.webhookHandler,
);

router.get(
  '/',
  LeadController.getAllLeads,
);

router.get(
  '/public',
  LeadController.findLeads,
);

router.patch(
  '/:id',
  validateRequest(LeadValidation.updateLeadZodSchema),
  LeadController.updateLead
);

router.delete(
  '/:id',
  LeadController.deleteLead
);

export const LeadRoutes = router;
