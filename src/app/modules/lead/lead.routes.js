import express from 'express';
import { LeadController } from './lead.controller.js';
import validateRequest from '../../middlewares/validateRequest.js';
import { LeadValidation } from './lead.validations.js';
import { requireAuth, requireRole } from '../../middlewares/wpAuth.js';
import { adminAuth } from '../../middlewares/adminAuth.js';


const router = express.Router();

router.post('/webhook', LeadController.webhookHandler);
// Protected routes
router.get('/',
  adminAuth,
  LeadController.getAllLeads);

router.get(
  '/max-lead-sale-count',
  adminAuth,
  LeadController.getAllLeadMembershipMaxSaleCounts
);
router.patch(
  '/:id/status',
  LeadController.updateStatus,
);

router.use(requireAuth);

router.get('/find', LeadController.findLeads);

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
