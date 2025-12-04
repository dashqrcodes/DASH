# 🚀 TikTok Gift Launch Checklist - Get to Production FAST

## ✅ COMPLETED
- [x] Mux tokens configured
- [x] Stripe secret key added
- [x] Project structure created
- [x] Core files in place

## 🔥 CRITICAL PATH TO LAUNCH (Do These First)

### 1. **Stripe Product Setup** (5 minutes)
**Action:** Create $199 product in Stripe dashboard
1. Go to https://dashboard.stripe.com → Products
2. Click "Add product"
3. Name: "Timeless Transparency Gift"
4. Price: $199.00 USD (one-time)
5. Copy the **Price ID** (starts with `price_`)
6. Add to `.env.local`: `STRIPE_PRICE_ID=price_xxxxx`

### 2. **Supabase Setup** (10 minutes)
**Action:** Create new Supabase project for TikTok orders

#### A. Create Project
1. Go to https://supabase.com → New Project
2. Name: "dash-tiktok-gift" (or similar)
3. Wait for initialization (~2 minutes)

#### B. Get Credentials
1. Project Settings → API
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ SECRET!

#### C. Create Database Table
Go to SQL Editor and run:
```sql
-- Create stories table
CREATE TABLE stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  photo_url TEXT NOT NULL,
  video_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX idx_stories_slug ON stories(slug);

-- Enable RLS
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- Public can view stories
CREATE POLICY "Public can view stories"
  ON stories FOR SELECT
  USING (true);

-- Service role can insert
CREATE POLICY "Service role can insert stories"
  ON stories FOR INSERT
  WITH CHECK (true);
```

#### D. Create Storage Bucket
1. Go to Storage → Create bucket
2. Name: `photos`
3. Make it **Public**
4. Done!

### 3. **Complete Code Fixes** (15 minutes)

#### A. Fix Video Upload Flow
- Complete Mux video upload in `app/gift/page.tsx`
- Save video URL to Supabase after upload

#### B. Fix Video Player
- Update `app/[slug]/lovestory/page.tsx` to use Mux Player component
- Replace iframe with proper Mux video player

#### C. Complete Placeholder Functions
- Implement `colorEngine.ts` (use `colorthief` or similar)
- Implement `placementEngine.ts` (basic image analysis)

### 4. **Stripe Webhook Setup** (5 minutes)
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-domain.com/api/webhooks/stripe`
3. Select event: `checkout.session.completed`
4. Copy **Signing secret** → `STRIPE_WEBHOOK_SECRET`

### 5. **Deploy to Vercel** (10 minutes)

#### A. Deploy gift-build folder
```bash
cd gift-build
vercel --prod
```

#### B. Add Environment Variables in Vercel
Copy all values from `.env.local` to Vercel dashboard:
- All Supabase vars
- All Mux vars
- All Stripe vars
- `NEXT_PUBLIC_SITE_URL` (your production domain)

#### C. Custom Domain (Optional)
- Add custom domain in Vercel
- Update `NEXT_PUBLIC_SITE_URL` to match

## 🎨 VIRAL OPTIMIZATION (Post-Launch)

### TikTok-Ready Landing Page
- [ ] Mobile-first design (vertical 9:16)
- [ ] Fast loading (< 2 seconds)
- [ ] Clear value proposition
- [ ] Social proof/testimonials
- [ ] Share buttons
- [ ] SEO meta tags

### Marketing Hooks
- [ ] "Turn your favorite photo into a timeless gift"
- [ ] "Scan QR code to watch your video forever"
- [ ] "Perfect for anniversaries, birthdays, memorials"
- [ ] Before/after examples

## 📋 FINAL CHECKLIST BEFORE LAUNCH

- [ ] All environment variables set in Vercel
- [ ] Stripe product created and price ID added
- [ ] Supabase table created and bucket configured
- [ ] Video upload working end-to-end
- [ ] PDF generation working
- [ ] QR codes generating correctly
- [ ] Checkout flow complete
- [ ] Webhook handling payment confirmations
- [ ] Test purchase end-to-end
- [ ] Mobile responsive
- [ ] Fast page load times

## 🚀 LAUNCH COMMANDS

```bash
# 1. Install dependencies
cd gift-build
npm install

# 2. Test locally
npm run dev
# Visit http://localhost:3003/gift

# 3. Build for production
npm run build

# 4. Deploy to Vercel
vercel --prod
```

## 📱 TIKTOK SHARING STRATEGY

1. **Create demo video** showing the product
2. **Use hashtags**: #timelessgift #personalizedgift #qrcode #memories
3. **Link in bio** to `/gift` page
4. **Track conversions** via Stripe dashboard

---

**ESTIMATED TIME TO LAUNCH: 45-60 minutes**

Let's get this live! 🎉

