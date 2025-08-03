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

export const LeadRoutes = router;
