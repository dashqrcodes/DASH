import Stripe from 'stripe';

let stripeClient: Stripe | null = null;

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('Stripe secret key not configured');
  }
  if (!stripeClient) {
    stripeClient = new Stripe(key, { typescript: true });
  }
  return stripeClient;
}

// Create payment intent for memorial products
export async function createPaymentIntent(amount: number, currency: string = 'usd') {
  const stripe = getStripe();
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
  const stripe = getStripe();
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
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  
  return stripe.webhooks.constructEvent(
    rawBody,
    signature,
    webhookSecret
  );
}
