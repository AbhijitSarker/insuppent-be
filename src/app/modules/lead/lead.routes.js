import express from 'express';
import { LeadController } from './lead.controller.js';

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

export const LeadRoutes = router;
