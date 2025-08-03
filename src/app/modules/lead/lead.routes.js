import express from 'express';
import { LeadController } from './lead.controller.js';

const router = express.Router();

router.post(
  '/webhook',
  LeadController.webhookHandler,
);


export const LeadRoutes = router;
