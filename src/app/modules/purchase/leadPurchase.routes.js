import express from 'express';
import { createCheckoutSession, stripeWebhook, getPurchaseHistory, getMyLeadsController, updateLeadStatusController, upsertLeadCommentController } from './leadPurchase.controller.js';
import { getUserPurchasedLeadsController } from './leadPurchase.controller.js';
import { requireAuth } from '../../middlewares/wpAuth.js';

const router = express.Router();

router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

router.use(requireAuth)

router.post('/checkout', createCheckoutSession);
router.get('/history', getPurchaseHistory);
router.get('/my-leads', getMyLeadsController);
router.patch('/:leadId/status', updateLeadStatusController);
router.patch('/:leadId/comment', upsertLeadCommentController);
router.get('/user/:userId/leads', getUserPurchasedLeadsController);

export default router;
