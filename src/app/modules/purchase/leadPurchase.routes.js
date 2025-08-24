import express from 'express';
import { createCheckoutSession, stripeWebhook, getPurchaseHistory, getMyLeadsController } from './leadPurchase.controller.js';
// import auth from '../../middlewares/auth.js';

const router = express.Router();


router.post('/checkout', createCheckoutSession);
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);
router.get('/history', getPurchaseHistory);
router.get('/my-leads', getMyLeadsController);

export default router;
