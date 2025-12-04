# Environment Variables Setup Guide

## Current Placeholders in .env.local

```
YOUR_URL_HERE          → Supabase Project URL
YOUR_ANON_KEY_HERE     → Supabase Anon/Public Key
YOUR_SERVICE_ROLE_KEY_HERE → Supabase Service Role Key (SECRET!)
YOUR_MUX_TOKEN_ID      → Mux API Token ID
YOUR_MUX_TOKEN_SECRET  → Mux API Token Secret
YOUR_STRIPE_SECRET_KEY → Stripe Secret Key (sk_...)
YOUR_STRIPE_PRICE_ID   → Stripe Price ID (price_...)
```

## Step-by-Step Setup

### 1. Supabase Setup (New Project for TikTok Orders)

1. Go to https://supabase.com
2. Create a new project (or use existing)
3. Wait for project to finish initializing
4. Go to **Project Settings** → **API**
5. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ KEEP SECRET!)

6. Set up database table (see SUPABASE_SETUP.md):
   ```sql
   CREATE TABLE stories (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     slug TEXT UNIQUE NOT NULL,
     photo_url TEXT NOT NULL,
     video_url TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

7. Create storage bucket:
   - Go to **Storage** → **Create bucket**
   - Name: `photos`
   - Set to **Public**

### 2. Mux Setup

1. Go to https://dashboard.mux.com
2. Navigate to **Settings** → **Access Tokens**
3. Create a new token (or use existing)
4. Copy:
   - **Token ID** → `MUX_TOKEN_ID`
   - **Token Secret** → `MUX_TOKEN_SECRET`

### 3. Stripe Setup

1. Go to https://dashboard.stripe.com
2. **Create Product**:
   - Name: "Timeless Transparency Gift"
   - Price: $199.00 USD
   - One-time payment
   - Save and copy the **Price ID** (starts with `price_`)
   
3. Get API Keys:
   - Go to **Developers** → **API keys**
   - Copy **Secret key** (starts with `sk_`) → `STRIPE_SECRET_KEY`
   - Use test mode keys for development

4. Set up Webhook:
   - Go to **Developers** → **Webhooks**
   - Add endpoint: `https://your-domain.com/api/webhooks/stripe`
   - Select event: `checkout.session.completed`
   - Copy **Signing secret** → `STRIPE_WEBHOOK_SECRET`

### 4. Update .env.local

Once you have all values, replace the placeholders in `gift-build/.env.local`:

```bash
# Edit the file manually or use the template below
```

## Quick Copy Template

After gathering all values, update `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Mux
MUX_TOKEN_ID=xxxxx-xxxxx-xxxxx
MUX_TOKEN_SECRET=xxxxx-xxxxx-xxxxx

# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PRICE_ID=price_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3003
```

## Verification

After updating `.env.local`, restart your dev server:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

The server will automatically load the new environment variables.


