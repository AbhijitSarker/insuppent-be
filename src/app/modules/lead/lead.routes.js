import express from 'express';
import { LeadController } from './lead.controller.js';
import validateRequest from '../../middlewares/validateRequest.js';
import { LeadValidation } from './lead.validations.js';
import auth from '../../middlewares/auth.js';
import { ENUM_USER_ROLE } from '../../../enums/user.js';

const router = express.Router();

router.post('/webhook', LeadController.webhookHandler);

// Protected routes
router.get('/', auth(ENUM_USER_ROLE.ADMIN), LeadController.getAllLeads);
router.get('/find', LeadController.findLeads);
router.get('/:id', auth(ENUM_USER_ROLE.ADMIN), LeadController.getSingleLead);
router.patch(
  '/:id',
  auth(ENUM_USER_ROLE.ADMIN),
  validateRequest(LeadValidation.updateLeadZodSchema),
  LeadController.updateLead,
);
router.delete('/:id', auth(ENUM_USER_ROLE.ADMIN), LeadController.deleteLead);
router.patch(
  '/:id/status',
  auth(ENUM_USER_ROLE.ADMIN),
  LeadController.updateStatus,
);

export const LeadRoutes = router;
