# 🚀 NEXT STEPS - DASH IS LIVE!

## ✅ What's Done:
- Code deployed to Vercel ✅
- Site is live at: https://dash-wine-eight.vercel.app ✅
- Memorial card builder working ✅

## ⏳ What's Next:

### Step 1: Add Environment Variables to Vercel
Go to: https://vercel.com/dashqrcodes/DASH/settings/environment-variables

Add these 7 variables:

1. **CLOUDINARY_URL**
   Value: `cloudinary://936793599379724:Tejbnin77Rb6AE2Am5g8CvMSF3s@djepgisuk`

2. **CLOUDINARY_CLOUD_NAME**
   Value: `djepgisuk`

3. **CLOUDINARY_API_KEY**
   Value: `936793599379724`

4. **CLOUDINARY_API_SECRET**
   Value: `Tejbnin77Rb6AE2Am5g8CvMSF3s`

5. **NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME**
   Value: `djepgisuk`

6. **NEXT_PUBLIC_SUPABASE_URL**
   Value: `https://urnkszyyabomkpujkzo.supabase.co`

7. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVybmtzenlieWFib21rcHVqa3pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyNzM2MTcsImV4cCI6MjA3Njg0OTYxN30.TqwxERGGqOPBlwlhyidUmZ2ktFFaLT2FMfZvreicNt4`

⚠️ For each variable, check: Production, Preview, Development
⚠️ After adding all, go to Deployments → Redeploy

### Step 2: Connect dashmemories.com Domain
1. Go to: https://vercel.com/dashqrcodes/DASH/settings/domains
2. Click "Add Domain"
3. Type: `dashmemories.com`
4. Follow Vercel's DNS instructions
5. Update GoDaddy DNS records
6. Wait 5-15 minutes for DNS propagation

### Step 3: Get Stripe Keys (When Ready)
1. Go to: https://dashboard.stripe.com/test/apikeys
2. Copy your test keys
3. Add to Vercel environment variables

### Step 4: Test Everything!
- Visit: https://dash-wine-eight.vercel.app
- Test memorial card builder
- Test photo uploads (Cloudinary)
- Test form submissions (Supabase)

🎉 YOU'RE ALMOST THERE!
