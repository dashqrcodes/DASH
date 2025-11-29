# 🧪 Test Mode Setup Guide

## Overview

Test Mode allows you to test the complete order flow without:
- ✅ Real Stripe payments (no charges)
- ✅ Real email sending (logs instead)
- ✅ Real Uber delivery requests (mocks delivery)
- ✅ Production order processing

## How to Enable Test Mode

### Option 1: Environment Variable (Recommended)

Add to your `.env.local` file:

```bash
TEST_MODE=true
```

Or:

```bash
DEMO_MODE=true
```

### Option 2: Automatic in Development

Test mode is **automatically enabled** in development (`NODE_ENV=development`) unless explicitly disabled.

### Option 3: Vercel Environment Variables

For Vercel deployments:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   - **Name:** `TEST_MODE`
   - **Value:** `true`
   - **Environment:** Development, Preview (optional), Production (optional)

## What Happens in Test Mode

### 1. **Print Order Processing** (`/api/generate-print-pdfs`)
- ✅ PDFs are still generated (for testing design)
- ❌ **Email is NOT sent** to print shop
- ✅ Order details are logged to console
- ✅ Returns success response with `testMode: true` flag

**Console Output:**
```
🧪 TEST MODE: Skipping email send. Order details: {
  orderNumber: "...",
  customer: "...",
  funeralHome: "...",
  products: "..."
}
```

### 2. **Stripe Payments** (`/api/print-shop/courier-pickup`)
- ❌ **No real Stripe charges** are created
- ✅ Mock payment intent is returned
- ✅ Payment status shows as `succeeded` (fake)
- ✅ Returns `testMode: true` flag

**Response:**
```json
{
  "success": true,
  "message": "🧪 TEST MODE: Mock payment intent created (no real charge)",
  "paymentIntentId": "pi_test_1234567890",
  "paymentStatus": "succeeded",
  "testMode": true
}
```

### 3. **Uber Delivery** (`/api/uber/request-delivery`)
- ❌ **No real courier** is requested
- ✅ Mock delivery ID is returned
- ✅ Mock tracking URL is provided
- ✅ Returns `isMock: true` and `testMode: true` flags

**Response:**
```json
{
  "success": true,
  "deliveryId": "uber_test_ORDER123_1234567890",
  "trackingUrl": "https://courier.uber.com/track/uber_test_...",
  "status": "requested",
  "etaMinutes": 18,
  "message": "🧪 TEST MODE: Mock delivery created (no real courier requested)",
  "isMock": true,
  "testMode": true
}
```

## Testing the Full Flow

### Step 1: Enable Test Mode

```bash
# In .env.local
TEST_MODE=true
```

### Step 2: Run Development Server

```bash
npm run dev
```

### Step 3: Test Order Flow

1. **Create Memorial** (`/create-dash`)
   - Fill out form
   - Design card/poster
   - Approve order

2. **Check Console Logs**
   - Look for `🧪 TEST MODE:` messages
   - Verify order details are logged
   - No emails sent, no charges made

3. **Verify API Responses**
   - All responses include `testMode: true`
   - Mock IDs are generated
   - Success messages indicate test mode

### Step 4: Check Print Shop Dashboard

- Orders appear in dashboard
- Status updates work normally
- No real payments or deliveries triggered

## Production vs Test Mode

### Test Mode (`TEST_MODE=true`)
- ✅ PDFs generated
- ❌ No emails sent
- ❌ No Stripe charges
- ❌ No Uber deliveries
- ✅ All responses marked with test mode flags

### Production Mode (`TEST_MODE=false` or unset in production)
- ✅ PDFs generated
- ✅ Emails sent to print shop
- ✅ Real Stripe charges
- ✅ Real Uber deliveries
- ✅ Full order processing

## Disabling Test Mode

To disable test mode:

1. **Remove environment variable:**
   ```bash
   # Remove from .env.local
   # TEST_MODE=true  <-- Comment out or delete
   ```

2. **Or explicitly set to false:**
   ```bash
   TEST_MODE=false
   ```

3. **In Production:**
   - Don't set `TEST_MODE=true` in Vercel
   - Or explicitly set `TEST_MODE=false`

## Safety Features

### Automatic Detection
- Test mode is **automatically enabled** in development
- Production requires explicit `TEST_MODE=true` to enable
- Prevents accidental test mode in production

### Clear Indicators
- All test mode responses include `🧪 TEST MODE:` in messages
- `testMode: true` flag in JSON responses
- Console logs clearly marked with test mode prefix

### No Real Transactions
- Stripe payment intents are completely mocked
- No API calls to Stripe in test mode
- No real delivery requests to Uber
- No emails sent (even if SMTP configured)

## Example Test Flow

```bash
# 1. Enable test mode
echo "TEST_MODE=true" >> .env.local

# 2. Start server
npm run dev

# 3. Create test order through UI

# 4. Check console for:
🧪 TEST MODE: Skipping email send. Order details: {...}
🧪 TEST MODE: Mock payment intent created
🧪 TEST MODE: Mock Uber delivery created

# 5. Verify no charges in Stripe dashboard
# 6. Verify no emails sent
# 7. Verify no real Uber deliveries
```

## Troubleshooting

### Test Mode Not Working

**Check:**
1. Environment variable is set: `TEST_MODE=true`
2. Restart dev server after changing `.env.local`
3. Check console logs for test mode messages
4. Verify `testMode: true` in API responses

### Want to Test Email Sending

**Temporarily disable test mode:**
```bash
# Comment out TEST_MODE in .env.local
# TEST_MODE=true

# Restart server
npm run dev
```

### Want to Test Real Payments

**Use Stripe Test Mode:**
- Keep `TEST_MODE=true` (mocks everything)
- Or use Stripe test keys with `TEST_MODE=false` for partial testing

## Best Practices

1. **Always use test mode in development**
2. **Never set `TEST_MODE=true` in production** (unless explicitly testing)
3. **Check console logs** to verify test mode is active
4. **Test full flow** before disabling test mode
5. **Use Stripe test keys** if you need partial payment testing

