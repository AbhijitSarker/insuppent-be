import Stripe from 'stripe';
import { Lead } from '../lead/lead.model.js';
import { calculateLeadPrice } from '../../../utils/leadPricing.js';
import { LeadUser } from './leadUser.model.js';
import { User } from '../user/user.model.js';
import ApiError from '../../../errors/ApiError.js';
import config from '../../../config/index.js';

const stripe = Stripe(process.env.STRIPE_SECRET_KEY || config.stripeSecretKey);

// Helper: get leads by IDs, check saleCount, etc.
async function getLeadsForPurchase(leadIds, userId) {
  const leads = await Lead.findAll({ where: { id: leadIds } });
  if (leads.length !== leadIds.length) throw new ApiError(400, 'Some leads not found');

  // Check saleCount and user previous purchases
  for (const lead of leads) {
    if (lead.saleCount >= lead.maxLeadSaleCount) {
      throw new ApiError(400, `Lead ${lead.name} has reached max sale count`);
    }
    const alreadyPurchased = await LeadUser.findOne({ where: { userId, leadId: lead.id } });
    if (alreadyPurchased) {
      throw new ApiError(400, `You have already purchased lead ${lead.id}`);
    }
  }
  return leads;
}

export async function createCheckoutSession(req, res, next) {
  try {
    const { leadIds } = req.body;
    console.log('Creating checkout session for leads:', leadIds);
    const userId = req.user.id;
    if (!Array.isArray(leadIds) || leadIds.length === 0) throw new ApiError(400, 'No leads selected');
    const leads = await getLeadsForPurchase(leadIds, userId);
    console.log('Leads for purchase:', leads);
    // Get user subscription/memberLevel for pricing
    const memberLevel = req.user.subscription || req.user.memberLevel || 'basic';
    const line_items = leads.map(lead => {
      const price = calculateLeadPrice(memberLevel, lead.type);
      if (!price) throw new ApiError(400, `No price found for lead type: ${lead.type}`);
    return {
      price_data: {
        currency: 'usd',
        product_data: {
        name: `Lead: ${lead.name.charAt(0).toUpperCase() + lead.name.slice(1)}`,
        description: `Type: ${lead.type.charAt(0).toUpperCase() + lead.type.slice(1)}`,
        },
        unit_amount: Math.round(price * 100),
      },
      quantity: 1,
    };
    });
    console.log('Line items for Stripe:', line_items);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      customer_email: req.user.email,
      metadata: {
        userId,
        leadIds: leadIds.join(','),
      },
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/my-leads?success=1`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}?canceled=1`,
    });
    res.json({ url: session.url });
  } catch (err) {
    next(err);
  }
}

export const stripeWebhook = async (req, res, next) => {
  let event;
  try {
    const sig = req.headers['stripe-signature'];
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET || config.stripeWebhookSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata.userId;
    const leadIds = session.metadata.leadIds.split(',').map(Number);
    for (const leadId of leadIds) {
      // Check again for max sale count and duplicate purchase
      const lead = await Lead.findByPk(leadId);
      if (!lead) continue;
      if (lead.saleCount >= lead.maxLeadSaleCount) continue;
      const alreadyPurchased = await LeadUser.findOne({ where: { userId, leadId } });
      if (alreadyPurchased) continue;
      await LeadUser.create({ userId, leadId, purchasedAt: new Date(), stripeSessionId: session.id });
      await lead.increment('saleCount');
    }
  }
  res.json({ received: true });
};

export const getPurchaseHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const purchases = await LeadUser.findAll({
      where: { userId },
      include: [{ model: Lead }],
      order: [['purchasedAt', 'DESC']],
    });
    res.json({ data: purchases });
  } catch (err) {
    next(err);
  }
};
