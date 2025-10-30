# 💳 Stripe Setup for DASH

## What Stripe Does for Us:

✅ **Payments** - Accept cards, Apple Pay, Google Pay
✅ **BNPL** - Affirm integration for installments  
✅ **Webhooks** - Instant payment notifications
✅ **Subscriptions** - Monthly/annual plans (future)

## Setup Instructions:

### 1. Get Your Stripe Keys:

1. Go to: https://dashboard.stripe.com/test/apikeys
2. Copy your **Publishable key** (starts with `pk_test_`)
3. Copy your **Secret key** (starts with `sk_test_`)

### 2. Add to .env.local:

```bash
STRIPE_SECRET_KEY=sk_test_YOUR_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY
```

### 3. Add to Vercel Environment Variables:

Same keys as above!

### 4. Set Up Webhooks:

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click "+ Add endpoint"
3. Endpoint URL: `https://your-site.vercel.app/api/webhooks/stripe`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `checkout.session.completed`
5. Copy webhook signing secret (starts with `whsec_`)
6. Add to .env: `STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET`

## Pricing Tiers (Groman Mortuary):

- **Basic**: $250 (4x6 card + 20x30 enlargement + QR code)
- **Premium**: $350 (Everything + AI slideshow)

## Usage:

```typescript
import { createPaymentIntent } from '@/lib/utils/stripe';

const handleCheckout = async (amount: number) => {
  const paymentIntent = await createPaymentIntent(amount);
  // Redirect to Stripe Checkout
};
```

## Next Steps:
- Set up Affirm for BNPL
- Create checkout pages
- Handle payment webhooks
- Auto-send PDFs after payment

Ready! 🚀
