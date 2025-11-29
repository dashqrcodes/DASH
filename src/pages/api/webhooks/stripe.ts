// Stripe Webhook Handler
// Receives events from Stripe about payment status changes
import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { buffer } from 'micro';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-10-29.clover',
});

// Disable body parser, we need raw body for Stripe signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'] as string;

  if (!sig) {
    return res.status(400).json({ error: 'Missing stripe-signature header' });
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.warn('⚠️ Stripe webhook secret not configured');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  let event: Stripe.Event;

  try {
    // Get raw body for signature verification
    const buf = await buffer(req);
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  console.log('📨 Stripe webhook received:', event.type);

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await handlePaymentSucceeded(paymentIntent);
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object as Stripe.PaymentIntent;
      await handlePaymentFailed(failedPayment);
      break;

    case 'charge.succeeded':
      const charge = event.data.object as Stripe.Charge;
      await handleChargeSucceeded(charge);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  // Return a response to acknowledge receipt of the event
  return res.status(200).json({ received: true });
}

// Handle successful payment
async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const orderNumber = paymentIntent.metadata?.orderNumber;
  const orderId = paymentIntent.metadata?.orderId;

  console.log('✅ Payment succeeded:', {
    paymentIntentId: paymentIntent.id,
    orderNumber,
    orderId,
    amount: paymentIntent.amount / 100
  });

  // TODO: Update order status in Supabase
  // Mark order as paid and update payment status
  if (orderId) {
    // Update order record
    console.log(`💳 Order ${orderNumber} payment confirmed: $${paymentIntent.amount / 100}`);
  }
}

// Handle failed payment
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const orderNumber = paymentIntent.metadata?.orderNumber;
  const orderId = paymentIntent.metadata?.orderId;

  console.error('❌ Payment failed:', {
    paymentIntentId: paymentIntent.id,
    orderNumber,
    orderId,
    error: paymentIntent.last_payment_error?.message
  });

  // TODO: Update order status in Supabase
  // Mark payment as failed, notify customer
  if (orderId) {
    console.log(`⚠️ Order ${orderNumber} payment failed`);
  }
}

// Handle successful charge (alternative to payment_intent.succeeded)
async function handleChargeSucceeded(charge: Stripe.Charge) {
  const orderNumber = charge.metadata?.orderNumber;
  const orderId = charge.metadata?.orderId;

  console.log('💳 Charge succeeded:', {
    chargeId: charge.id,
    paymentIntentId: charge.payment_intent,
    orderNumber,
    orderId,
    amount: charge.amount / 100
  });

  // TODO: Update order payment status in Supabase
}

