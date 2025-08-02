import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { webhookHandler, getLeads, getLead, updateLead } from '../controllers/leadController.js';

const router = Router();

// Public webhook endpoint
router.post('/webhook', webhookHandler);

// Protected routes
router.use(protect);

router.get('/', getLeads);
router.get('/:id', getLead);
router.patch('/:id', updateLead);

export default router;