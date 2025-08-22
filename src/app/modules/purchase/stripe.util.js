import Stripe from 'stripe';
import config from '../../../config/index.js';

const stripe = Stripe(process.env.STRIPE_SECRET_KEY || config.stripeSecretKey);

export function getStripeInstance() {
  return stripe;
}

export function createStripeSession(params) {
  return stripe.checkout.sessions.create(params);
}

export function constructStripeEvent(body, sig, webhookSecret) {
  return stripe.webhooks.constructEvent(body, sig, webhookSecret);
}
