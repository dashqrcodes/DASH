# 🚀 Deployment Steps - TikTok Gift Funnel

## ✅ Configuration Complete!

All environment variables are configured:
- ✅ Stripe (LIVE mode)
- ✅ Supabase
- ✅ Mux
- ✅ Twilio

## Step 1: Create Supabase Orders Table

1. Go to https://supabase.com/dashboard
2. Select your project: `trlpwzlfbmuqwasdomou`
3. Click **SQL Editor** in the left sidebar
4. Click **New query**
5. Copy and paste the contents of `SUPABASE_ORDERS_TABLE.sql`
6. Click **Run** (or press Cmd+Enter)
7. You should see "Success. No rows returned"

## Step 2: Test Locally

```bash
cd gift-build
npm install
npm run dev
```

Visit: http://localhost:3000/gift

Test the flow:
1. Upload a photo
2. Upload a video
3. Generate preview
4. Click checkout (will redirect to Stripe)

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard
1. Go to https://vercel.com
2. Click **Add New Project**
3. Import your GitHub repository
4. Set **Root Directory** to: `gift-build`
5. Add all environment variables from `.env.local`
6. Deploy!

### Option B: Deploy via CLI
```bash
cd gift-build
npm install -g vercel
vercel login
vercel --prod
```

Then add environment variables in Vercel dashboard.

## Step 4: Add Environment Variables to Vercel

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Add ALL of these (copy from `.env.local`):

**Supabase:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

**Stripe:**
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_PRICE_ID`
- `STRIPE_WEBHOOK_SECRET`

**Mux:**
- `MUX_TOKEN_ID`
- `MUX_TOKEN_SECRET`

**Application:**
- `NEXT_PUBLIC_APP_URL`

**Twilio (optional - not used in gift project):**
- `TWILIO_VERIFY_SID`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`

## Step 5: Update Stripe Webhook (if needed)

If your Vercel URL is different from `https://dashmemories.com`:
1. Go to Stripe Dashboard → Webhooks
2. Edit your webhook endpoint
3. Update URL to: `https://your-vercel-url.vercel.app/api/webhooks/stripe`
4. Get the new webhook secret and update in Vercel

## Step 6: Test Production

1. Visit your deployed URL
2. Test the full checkout flow
3. Check Stripe Dashboard for test payment
4. Check Supabase `orders` table for new order

## 🎉 You're Live!

Your TikTok Gift Funnel is now deployed and ready to accept orders!

