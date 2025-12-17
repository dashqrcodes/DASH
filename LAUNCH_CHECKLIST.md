# 🚀 LAUNCH CHECKLIST - Dash.gift

## ✅ Supabase Connection Status

**YES - Connected!** Supabase is configured and ready. You need to:

1. **Set Environment Variables** (see below)
2. **Run Database Schema** (one-time setup)
3. **Configure Stripe** (for payments)
4. **Configure Email** (for vendor PDFs)

---

## 📋 Required Environment Variables

### 🔴 CRITICAL (Must Have)

#### Supabase (Database & Storage)
```env
NEXT_PUBLIC_SUPABASE_URL=https://urnkszyyabomkpujkzo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_URL=https://urnkszyyabomkpujkzo.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Stripe (Payments)
```env
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_ACRYLIC=price_...  # Your $199 acrylic product price ID
```

#### Mux (Video Hosting)
```env
MUX_TOKEN_ID=...
MUX_TOKEN_SECRET=...
```

### 🟡 IMPORTANT (For Full Functionality)

#### Email (Vendor PDF Delivery)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@dash.gift
PRINT_SHOP_EMAIL=vendor@printshop.com
```

#### App URL
```env
NEXT_PUBLIC_APP_URL=https://dash.gift
```

---

## 🗄️ Database Setup (One-Time)

### Step 1: Create `drafts` Table

Go to Supabase SQL Editor: https://supabase.com/dashboard/project/urnkszyyabomkpujkzo/sql/new

Run this SQL:

```sql
-- Create drafts table for gift orders
CREATE TABLE IF NOT EXISTS drafts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'checkout_pending', 'paid', 'completed')),
  photo_url TEXT,
  videos JSONB DEFAULT '{}'::jsonb,
  stripe_checkout_session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_drafts_slug ON drafts(slug);
CREATE INDEX IF NOT EXISTS idx_drafts_status ON drafts(status);
CREATE INDEX IF NOT EXISTS idx_drafts_stripe_session ON drafts(stripe_checkout_session_id);

-- Enable RLS (Row Level Security)
ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for viewing drafts)
CREATE POLICY "Allow public read" ON drafts
  FOR SELECT
  USING (true);

-- Allow service role full access (for API routes)
CREATE POLICY "Allow service role" ON drafts
  FOR ALL
  USING (true);
```

### Step 2: Create Storage Buckets

Go to Supabase Storage: https://supabase.com/dashboard/project/urnkszyyabomkpujkzo/storage/buckets

Create these buckets:

1. **`temp-videos`** (public: false)
   - For temporary video storage before Mux migration
   - Auto-delete after 24 hours (optional)

2. **`photos`** (public: true)
   - For permanent photo storage
   - Public access for displaying images

---

## 🔧 Vercel Deployment Setup

### Step 1: Connect Repository
- Go to Vercel Dashboard
- Import your GitHub repository
- Select `nextjs-auth-app` as root directory

### Step 2: Add Environment Variables
In Vercel Dashboard → Settings → Environment Variables, add ALL variables from above.

### Step 3: Configure Stripe Webhook
1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-domain.vercel.app/api/webhooks/stripe`
3. Select event: `checkout.session.completed`
4. Copy webhook secret → Add to `STRIPE_WEBHOOK_SECRET`

### Step 4: Deploy
- Push to `main` branch → Auto-deploys
- Or manually trigger deployment

---

## ✅ Pre-Launch Testing

### 1. Test Supabase Connection
```bash
curl https://your-domain.vercel.app/api/test-supabase
# Should return: {"success":true,"connected":true}
```

### 2. Test Draft Creation
```bash
curl -X POST https://your-domain.vercel.app/api/drafts/create
# Should return: {"slug":"...","url":"..."}
```

### 3. Test Photo Upload
- Visit `/gift` page
- Upload a photo
- Verify mockup appears instantly
- Check Supabase Storage for uploaded photo

### 4. Test Checkout Flow
- Upload photo → See mockup
- Upload video (optional)
- Click checkout → See PDF preview
- Complete Stripe payment (use test mode first!)
- Verify webhook processes payment
- Check email sent to vendor

---

## 🚨 Common Issues & Fixes

### Issue: "Missing Supabase environment variables"
**Fix:** Add all `NEXT_PUBLIC_SUPABASE_*` and `SUPABASE_*` vars to Vercel

### Issue: "Draft not found"
**Fix:** Run the SQL schema to create `drafts` table

### Issue: "Stripe Price ID not configured"
**Fix:** Create a product in Stripe Dashboard → Copy Price ID → Add to `STRIPE_PRICE_ID_ACRYLIC`

### Issue: "Failed to upload video"
**Fix:** Create `temp-videos` storage bucket in Supabase

### Issue: "PDF not sent to vendor"
**Fix:** Configure SMTP credentials (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`)

---

## 📊 Monitoring After Launch

1. **Vercel Logs** - Check for errors
2. **Stripe Dashboard** - Monitor payments
3. **Supabase Dashboard** - Check database queries
4. **Email** - Verify vendor receives PDFs

---

## 🎯 Quick Start Commands

```bash
# Local development
cd nextjs-auth-app
npm install
npm run dev

# Test Supabase connection
curl http://localhost:3000/api/test-supabase

# Build for production
npm run build
npm start
```

---

## ✅ Launch Checklist

- [ ] All environment variables set in Vercel
- [ ] Database schema run in Supabase
- [ ] Storage buckets created (`temp-videos`, `photos`)
- [ ] Stripe webhook configured
- [ ] Stripe Price ID set (`STRIPE_PRICE_ID_ACRYLIC`)
- [ ] Email credentials configured (SMTP)
- [ ] Vendor email set (`PRINT_SHOP_EMAIL`)
- [ ] Test checkout flow end-to-end
- [ ] Verify PDF generation works
- [ ] Confirm email delivery to vendor
- [ ] Domain configured (if using custom domain)

---

## 🎉 You're Ready to Launch!

Once all checkboxes are complete, your site is ready for production traffic.

