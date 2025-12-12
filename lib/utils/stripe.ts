import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
  typescript: true,
});

// Create payment intent for memorial products
export async function createPaymentIntent(amount: number, currency: string = 'usd') {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100, // Convert to cents
    currency,
    payment_method_types: ['card', 'apple_pay', 'google_pay'],
    metadata: {
      product: 'memorial',
    },
  });

  return paymentIntent;
}

// Create checkout session
export async function createCheckoutSession(
  lineItems: { price: string; quantity: number }[],
  successUrl: string,
  cancelUrl: string
) {
  const session = await stripe.checkout.sessions.create({
    line_items: lineItems,
    mode: 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return session;
}

// Handle webhook events
export function handleStripeWebhook(rawBody: string, signature: string) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  
  return stripe.webhooks.constructEvent(
    rawBody,
    signature,
    webhookSecret
  );
}
