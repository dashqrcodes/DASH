# 🚀 Quick Start - Get Live in 30 Minutes

## ✅ CODE FIXES COMPLETED
- ✅ Video upload flow fixed (uploads to Mux directly)
- ✅ Video player fixed (uses proper Mux playback)
- ✅ Checkout page created
- ✅ Story saving to Supabase after upload
- ✅ Mux tokens configured
- ✅ Stripe secret key configured

## 🔥 WHAT YOU NEED TO DO NOW

### Step 1: Stripe Product (2 minutes)
1. Go to https://dashboard.stripe.com → Products → Add product
2. Name: "Timeless Transparency Gift"
3. Price: $199.00 USD (one-time)
4. Copy the **Price ID** (starts with `price_`)
5. Run this command to add it:
   ```bash
   cd gift-build
   sed -i '' "s/STRIPE_PRICE_ID=YOUR_STRIPE_PRICE_ID/STRIPE_PRICE_ID=price_YOUR_ID_HERE/" .env.local
   ```
   (Replace `price_YOUR_ID_HERE` with your actual price ID)

### Step 2: Supabase Setup (10 minutes)

#### A. Create Project
1. Go to https://supabase.com → New Project
2. Name it (e.g., "dash-tiktok-gift")
3. Wait ~2 minutes for setup

#### B. Get Credentials
1. Project Settings → API
2. Copy these 3 values:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`

#### C. Create Table
1. Go to SQL Editor
2. Paste and run this:
```sql
CREATE TABLE stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  photo_url TEXT NOT NULL,
  video_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_stories_slug ON stories(slug);

ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view stories"
  ON stories FOR SELECT
  USING (true);

CREATE POLICY "Service role can insert stories"
  ON stories FOR INSERT
  WITH CHECK (true);
```

#### D. Create Storage Bucket
1. Storage → Create bucket
2. Name: `photos`
3. Make it **Public**
4. Done!

### Step 3: Update .env.local
Add all the Supabase values you copied:
```bash
cd gift-build
nano .env.local
# Or open in Cursor and edit manually
```

### Step 4: Test Locally
```bash
cd gift-build
npm install
npm run dev
```
Visit: http://localhost:3003/gift

### Step 5: Deploy to Vercel
```bash
cd gift-build
vercel --prod
```

Then add ALL environment variables from `.env.local` to Vercel dashboard.

### Step 6: Stripe Webhook
1. Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-vercel-url.vercel.app/api/webhooks/stripe`
3. Select event: `checkout.session.completed`
4. Copy signing secret → Add to Vercel env vars as `STRIPE_WEBHOOK_SECRET`

## 🎯 YOU'RE LIVE!

Your page will be at: `https://your-vercel-url.vercel.app/gift`

Share it on TikTok with:
- Hashtags: #timelessgift #personalizedgift #qrcode
- Demo video showing the product
- Link in bio

---

**Total time: ~30 minutes**

