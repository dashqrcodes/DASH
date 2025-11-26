# 🚀 Complete Integration Setup: Stripe, Twilio, Music

## Overview

Your app needs these integrations properly hooked up:
1. **Stripe** - Payment processing
2. **Twilio** - SMS OTP for mobile authentication
3. **Music/Spotify** - Music integration for memorials

Each needs database tables and environment variables. Here's the complete setup.

---

## 💳 1. STRIPE SETUP

### Database Tables Needed:
- ✅ `payments` - Store payment transactions
- ✅ `orders` - Link payments to orders
- ✅ `profiles` - Store customer info

### Step 1: Get Stripe Keys

1. **Sign up:** https://stripe.com
2. **Dashboard:** https://dashboard.stripe.com
3. **Get Keys:**
   - **Test Mode:** Get test keys (starts with `pk_test_` and `sk_test_`)
   - **Production Mode:** Get live keys (starts with `pk_live_` and `sk_live_`)

### Step 2: Environment Variables

**Local (`.env.local`):**
```env
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

**Vercel (Production):**
1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Add:
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_WEBHOOK_SECRET`

### Step 3: Create Webhook Endpoint

1. **Stripe Dashboard** → **Developers** → **Webhooks**
2. **Add endpoint:** `https://yourdomain.com/api/webhooks/stripe`
3. **Select events:**
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `checkout.session.completed`
4. **Copy webhook secret** → Add to environment variables

### Step 4: Database Setup

**Run this SQL in Supabase:**

```sql
-- PAYMENTS table (if not exists)
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  order_id TEXT,
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT CHECK (status IN ('pending', 'succeeded', 'failed', 'canceled')),
  payment_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read own payments" ON public.payments 
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own payments" ON public.payments 
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);
```

### Step 5: Test Stripe

- Use test card: `4242 4242 4242 4242`
- Any future expiry date
- Any 3-digit CVC

---

## 📱 2. TWILIO SETUP (SMS OTP)

### Database Tables Needed:
- ✅ `profiles` - Store phone numbers and OTP codes

### Step 1: Get Twilio Credentials

1. **Sign up:** https://www.twilio.com/try-twilio
2. **Get credentials:**
   - **Account SID** (starts with `AC...`)
   - **Auth Token** (click "View" to reveal)
   - **Phone Number** (Buy a number: +1234567890)

### Step 2: Environment Variables

**Local (`.env.local`):**
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

**Vercel (Production):**
1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Add:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_PHONE_NUMBER`

### Step 3: Database Setup

**Run this SQL in Supabase:**

```sql
-- PROFILES table (if not exists)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL,
  phone_number TEXT,
  email TEXT,
  name TEXT,
  otp_code TEXT,
  otp_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read own profile" ON public.profiles 
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles 
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles 
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);
```

### Step 4: Test Twilio

- Send OTP to your phone number
- Should receive SMS instantly
- One-tap OTP should work on mobile

---

## 🎵 3. MUSIC/SPOTIFY SETUP

### Database Tables Needed:
- ✅ `profiles` - Store Spotify user data
- ✅ Optional: `music_preferences` - Store selected tracks

### Step 1: Create Spotify App

1. **Go to:** https://developer.spotify.com/dashboard
2. **Create App:**
   - App Name: "DASH Memorial App"
   - Redirect URI: `http://localhost:3000/api/spotify/callback`
   - Production Redirect URI: `https://yourdomain.com/api/spotify/callback`
3. **Get Credentials:**
   - **Client ID**
   - **Client Secret**

### Step 2: Environment Variables

**Local (`.env.local`):**
```env
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**Vercel (Production):**
1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Add:
   - `SPOTIFY_CLIENT_ID`
   - `SPOTIFY_CLIENT_SECRET`
   - `NEXT_PUBLIC_BASE_URL` (your production URL)

### Step 3: Database Setup (Optional)

**For storing Spotify tracks in database:**

```sql
-- MUSIC_PREFERENCES table (optional)
CREATE TABLE IF NOT EXISTS public.music_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  memorial_id TEXT,
  spotify_track_id TEXT,
  spotify_uri TEXT,
  track_name TEXT,
  artist_name TEXT,
  album_art_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.music_preferences ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage own music" ON public.music_preferences 
  FOR ALL USING (auth.uid()::text = user_id);
```

---

## 📋 COMPLETE TABLE LIST

### Required Tables (Keep All):

1. ✅ **`heaven_characters`** - Video URLs for Heaven pages
2. ✅ **`slideshow_media`** - Slideshow photos/videos
3. ✅ **`memorials`** - User memorials
4. ✅ **`profiles`** - User profiles (phone, email, Spotify data)
5. ✅ **`payments`** - Stripe payment records
6. ✅ **`orders`** - Orders linked to payments
7. ✅ **`collaborators`** - Collaboration features
8. ✅ **`comments`** - Comments on memorials
9. ✅ **`messages`** - Messages/chat
10. ✅ **`likes`** - Likes on memorials
11. ✅ **`avatars`** - AI avatar data
12. ✅ **`voices`** - Voice cloning data
13. ✅ **`calls`** - Voice call records
14. ✅ **`ai_jobs`** - AI processing jobs
15. ✅ **`media`** - Media files metadata

**Keep ALL tables!** They're all needed for different features.

---

## ✅ QUICK SETUP CHECKLIST

### Stripe:
- [ ] Get Stripe keys (test + production)
- [ ] Add to `.env.local` and Vercel
- [ ] Create webhook endpoint
- [ ] Run payments table SQL
- [ ] Test with test card

### Twilio:
- [ ] Get Twilio credentials
- [ ] Buy phone number
- [ ] Add to `.env.local` and Vercel
- [ ] Run profiles table SQL
- [ ] Test SMS OTP

### Spotify:
- [ ] Create Spotify app
- [ ] Add redirect URIs
- [ ] Add to `.env.local` and Vercel
- [ ] Test OAuth flow

### Database:
- [ ] Run all table creation SQL
- [ ] Verify RLS policies
- [ ] Test connections

---

## 🔗 API Routes Already Created

### Stripe:
- ✅ `/api/checkout-complete` - Payment processing
- ⚠️ Need: `/api/webhooks/stripe` - Webhook handler

### Twilio:
- ✅ `/api/send-otp` - Send SMS OTP
- ✅ `/api/verify-otp` - Verify OTP code

### Spotify:
- ✅ `/api/spotify/auth` - OAuth initiation
- ✅ `/api/spotify/callback` - OAuth callback
- ✅ `/api/spotify/search` - Track search

---

## 🚨 IMPORTANT NOTES

1. **Never commit `.env.local`** - It's already in `.gitignore`
2. **Use test keys in development** - Switch to live keys in production
3. **Test everything before going live**
4. **Monitor Stripe/Twilio dashboards** for usage/costs
5. **Set up webhooks properly** for real-time payment updates

---

## 📞 Need Help?

- **Stripe Docs:** https://stripe.com/docs
- **Twilio Docs:** https://www.twilio.com/docs
- **Spotify Docs:** https://developer.spotify.com/documentation

---

## 🎯 Next Steps

1. **Set up Stripe** (30 min)
2. **Set up Twilio** (15 min)
3. **Set up Spotify** (15 min)
4. **Run all SQL scripts** (10 min)
5. **Test everything** (30 min)

**Total time: ~1.5 hours** to get everything hooked up! 🚀

