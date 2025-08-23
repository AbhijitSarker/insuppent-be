// Get all leads purchased by the current user

import config from '../../../config/index.js';
import { getMyLeads } from './leadPurchase.service.js';

import ApiError from '../../../errors/ApiError.js';
import { getLeadsForPurchase, buildLineItems, recordLeadPurchases, getUserPurchaseHistory } from './leadPurchase.service.js';
import { createStripeSession, constructStripeEvent } from './stripe.util.js';

export const createCheckoutSession = async (req, res, next) => {
  try {
    const { leadIds } = req.body;
    const userId = req.user.id;
    console.log('User ID:', userId);
    if (!Array.isArray(leadIds) || leadIds.length === 0) return next(new ApiError(400, 'No leads selected'));
    const leads = await getLeadsForPurchase(leadIds, userId);
    const memberLevel = req.user.subscription || req.user.memberLevel || 'basic';
    const line_items = buildLineItems(leads, memberLevel);
    const session = await createStripeSession({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      customer_email: req.user.email,
      metadata: {
        userId,
        leadIds: leadIds.join(','),
      },
  success_url: `${config.frontendUrl || 'http://localhost:5173'}/my-leads?success=1`,
  cancel_url: `${config.frontendUrl || 'http://localhost:5173'}?canceled=1`,
    });
    res.json({ url: session.url });
  } catch (err) {
    next(err);
  }
};



export const stripeWebhook = async (req, res, next) => {
  console.log('stripeWebhook called');
  let event;
  try {
    const sig = req.headers['stripe-signature'];
    event = constructStripeEvent(
      req.body,
      sig,
      config.stripeWebhookSecret
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (event.type === 'checkout.session.completed') {
    console.log('checkout.session.completed event received');
    const session = event.data.object;
    const userId = session.metadata.userId;
    const leadIds = session.metadata.leadIds.split(',').map(Number);
    await recordLeadPurchases({ userId, leadIds, stripeSessionId: session.id });
  }
  res.json({ received: true });
};

export const getPurchaseHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const purchases = await getUserPurchaseHistory(userId);
    res.json({ data: purchases });
  } catch (err) {
    next(err);
  }
};

// GET /leads/my
export const getMyLeadsController = async (req, res, next) => {
  console.log('getMyLeadsController called', req.user);
  try {
    const userId = req.user.id;
    const leads = await getMyLeads(userId);
    res.json({ data: leads });
  } catch (err) {
    next(err);
  }
};