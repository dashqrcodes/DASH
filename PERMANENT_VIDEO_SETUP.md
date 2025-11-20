# Permanent Video Setup for QR Code Scans

## For Tomorrow's Demo - CRITICAL

Your QR code will be scanned by hundreds of devices. The video MUST be permanent.

## ✅ Solution: Environment Variables (5 Minutes)

### Step 1: Upload Your Video

1. Go to `https://dashmemories.com/heaven/kobe-bryant` (or kelly-wong)
2. Click "Upload Video File"
3. Wait for upload to complete (it will upload to Mux/Cloudinary)
4. **Copy the permanent URL** from the console log or success message

### Step 2: Add to Vercel Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com)
2. Select your **DASH** project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

**For Kobe Bryant:**
```
Key: NEXT_PUBLIC_KOBE_DEMO_VIDEO
Value: [Paste the permanent URL from Step 1]
Environment: ☑ Production ☑ Preview ☑ Development
```

**For Kelly Wong:**
```
Key: NEXT_PUBLIC_KELLY_DEMO_VIDEO
Value: [Paste the permanent URL from Step 1]
Environment: ☑ Production ☑ Preview ☑ Development
```

5. Click **Save** for each variable

### Step 3: Redeploy

1. Go to **Deployments** tab
2. Click **"..."** on latest deployment
3. Click **"Redeploy"**
4. Wait 1-2 minutes

### Step 4: Test

Visit:
- `https://dashmemories.com/heaven/kobe-bryant`
- `https://dashmemories.com/heaven/kelly-wong`

Videos should load for **everyone** who scans the QR code!

---

## How It Works Now

The system checks in this order:
1. **Environment Variables** (permanent, works for all devices) ⭐
2. **Supabase Database** (permanent, works for all devices)
3. **localStorage** (temporary, per-browser only)

Once you add the environment variables, the video will work for **everyone** who scans the QR code, regardless of device or browser.

---

## Quick Checklist

- [ ] Video uploaded via webapp
- [ ] Permanent URL copied
- [ ] Environment variables added to Vercel
- [ ] Vercel project redeployed
- [ ] Tested on different device/browser
- [ ] QR code tested

---

## Troubleshooting

**Video not showing for others?**
- Make sure environment variables are set for **Production**
- Make sure you **redeployed** after adding variables
- Check that the URL is a permanent link (Mux/Cloudinary, not blob/data URL)

**Need the URL?**
- Check browser console (F12) after upload - it logs the permanent URL
- Or check the success message on screen

---

## For Future: Automatic Setup

The upload now automatically:
1. Uploads to Mux/Cloudinary (permanent hosting)
2. Saves to Supabase database (cross-device persistence)
3. Logs the URL for you to add to environment variables

Once you add it to environment variables, it's permanent for everyone!


