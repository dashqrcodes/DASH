# Webhook Setup Guide

This document explains how to configure webhooks for Stripe and Uber Direct integrations.

## Stripe Webhooks

### What They Do
- Automatically update order payment status when payments succeed or fail
- Trigger when payment intents are created, succeeded, or failed
- Secure signature verification ensures requests are from Stripe

### Setup Steps

1. **Get Your Webhook Secret**
   - Go to [Stripe Dashboard](https://dashboard.stripe.com)
   - Navigate to Developers → Webhooks
   - Click "Add endpoint"
   - Enter endpoint URL: `https://yourdomain.com/api/webhooks/stripe`
   - Select events to listen for:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `charge.succeeded`
   - Copy the **Signing secret** (starts with `whsec_`)

2. **Configure Environment Variables**
   ```env
   STRIPE_SECRET_KEY=sk_live_... (or sk_test_...)
   STRIPE_WEBHOOK_SECRET=whsec_... (from step 1)
   ```

3. **Test Webhook**
   - Use Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
   - Or use Stripe Dashboard → Webhooks → Send test webhook

### Webhook Events Handled

- `payment_intent.succeeded` - Payment completed successfully
- `payment_intent.payment_failed` - Payment failed
- `charge.succeeded` - Charge completed (alternative event)

---

## Uber Direct Webhooks

### What They Do
- Receive real-time delivery status updates
- Automatically update order delivery status
- Trigger Stripe payment when courier picks up order

### Setup Steps

1. **Configure Uber Direct Webhook**
   - Go to [Uber Direct Dashboard](https://developer.uber.com/dashboard)
   - Navigate to Webhooks section
   - Add webhook URL: `https://yourdomain.com/api/webhooks/uber`
   - Select events to listen for:
     - `delivery.status_changed`
     - `delivery.courier_assigned`
     - `delivery.picked_up`
     - `delivery.completed`
     - `delivery.cancelled`

2. **Environment Variables**
   ```env
   UBER_DIRECT_SERVER_TOKEN=your_uber_server_token
   UBER_ORGANIZATION_ID=your_uber_org_id
   ```

3. **Webhook Signature Verification**
   - Uber sends `X-Uber-Signature` header
   - Verify signature matches expected format
   - Currently logs warning if signature missing (add verification in production)

### Delivery Status Flow

1. **Order marked "ready"** → Request Uber delivery
2. **Uber assigns courier** → Webhook: `delivery.courier_assigned`
3. **Courier en route** → Webhook: `delivery.status_changed` (status: `picking_up`)
4. **Courier picks up** → Webhook: `delivery.picked_up` → **Triggers Stripe Payment**
5. **In transit** → Webhook: `delivery.status_changed` (status: `in_transit`)
6. **Delivered** → Webhook: `delivery.completed` → Order status: `delivered`

---

## Testing Webhooks Locally

### Stripe CLI (Recommended)
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe  # macOS
# or download from https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test events
stripe trigger payment_intent.succeeded
```

### Uber Direct
- Use Uber Direct sandbox environment
- Or manually trigger test webhook from Uber Dashboard

---

## Production Setup

### Vercel Configuration

1. **Add Environment Variables in Vercel Dashboard:**
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `UBER_DIRECT_SERVER_TOKEN`
   - `UBER_ORGANIZATION_ID`

2. **Update Webhook URLs:**
   - Stripe: `https://yourdomain.com/api/webhooks/stripe`
   - Uber: `https://yourdomain.com/api/webhooks/uber`

3. **Security:**
   - Always verify webhook signatures
   - Use HTTPS only
   - Monitor webhook logs for errors

---

## Webhook Endpoints

- **Stripe:** `/api/webhooks/stripe`
- **Uber Direct:** `/api/webhooks/uber`

Both endpoints:
- Accept POST requests only
- Verify signatures for security
- Return 200 OK to acknowledge receipt
- Log all events for debugging

