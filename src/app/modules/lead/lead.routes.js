import express from 'express';
import { LeadController } from './lead.controller.js';
import validateRequest from '../../middlewares/validateRequest.js';
import { LeadValidation } from './lead.validations.js';
import { requireAuth, requireRole } from '../../middlewares/wpAuth.js';

const router = express.Router();

router.post('/webhook', LeadController.webhookHandler);

router.use(requireAuth);

// Protected routes
router.get('/',
  requireRole(['admin', 'administrator', 'manager']),
  LeadController.getAllLeads);

router.get('/find', LeadController.findLeads);

router.get(
  '/max-lead-sale-count',
  LeadController.getAllLeadMembershipMaxSaleCounts
);
router.get(
  '/:id',
  LeadController.getSingleLead
);
router.patch(
  '/:id',
  validateRequest(LeadValidation.updateLeadZodSchema),
  LeadController.updateLead,
);
router.delete(
  '/:id',
  LeadController.deleteLead);
router.patch(
  '/:id/status',
  LeadController.updateStatus,
);

// Get lead sale counts by membership
router.get(
  '/sale-counts',
  LeadController.getLeadSaleCountsByMembership
);

router.patch(
  '/max-lead-sale-count/:membership',
  LeadController.updateMaxLeadSaleCountByMembership
);

export const LeadRoutes = router;
