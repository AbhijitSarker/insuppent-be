import express from 'express';
import { createCheckoutSession, getPurchaseHistory, getMyLeadsController, updateLeadStatusController, upsertLeadCommentController } from './leadPurchase.controller.js';
import { getUserPurchasedLeadsController } from './leadPurchase.controller.js';
import { adminAuth } from '../../middlewares/adminAuth.js';

const router = express.Router();

// Stripe webhook route is handled in app.js before body parser

// Admin routes
router.get('/user/:userId/leads', adminAuth, getUserPurchasedLeadsController);

router.post('/checkout', createCheckoutSession);
router.get('/history', getPurchaseHistory);
router.get('/my-leads', getMyLeadsController);
router.patch('/:leadId/status', updateLeadStatusController);
router.patch('/:leadId/comment', upsertLeadCommentController);

export default router;
