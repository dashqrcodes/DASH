# How to Configure Mux for Video Uploads

## Step 1: Sign Up for Mux (Free Tier Available)

1. Go to [mux.com](https://mux.com)
2. Click **"Sign Up"** or **"Get Started"**
3. Create an account (free tier includes 10GB storage + 100GB bandwidth/month)
4. Verify your email

## Step 2: Get Your API Credentials

1. **Log in to Mux Dashboard**
2. Go to **Settings** → **API Access Tokens**
3. Click **"Generate New Token"**
4. Give it a name (e.g., "DASH Video Uploads")
5. **Copy these two values:**
   - **Token ID** (starts with something like `abc123...`)
   - **Token Secret** (long string, keep this secret!)

⚠️ **Important:** Copy the Token Secret immediately - you can't see it again!

## Step 3: Add to Vercel Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com)
2. Select your **DASH** project
3. Go to **Settings** → **Environment Variables**
4. Click **"Add New"**

**Add First Variable:**
- **Key:** `MUX_TOKEN_ID`
- **Value:** [Paste your Token ID from Step 2]
- **Environments:** ☑ Production ☑ Preview ☑ Development
- Click **"Save"**

**Add Second Variable:**
- **Key:** `MUX_TOKEN_SECRET`
- **Value:** [Paste your Token Secret from Step 2]
- **Environments:** ☑ Production ☑ Preview ☑ Development
- Click **"Save"**

## Step 4: Redeploy

1. Go to **Deployments** tab
2. Click **"..."** on latest deployment
3. Click **"Redeploy"**
4. Wait 1-2 minutes for build to complete

## Step 5: Test

1. Go to `https://dashmemories.com/heaven/kobe-bryant`
2. Click **"Upload Video File"**
3. Select a video
4. It should now upload to Mux successfully!

---

## Mux Pricing (Free Tier)

- **Free Tier:**
  - 10GB storage
  - 100GB bandwidth/month
  - Perfect for demos and testing

- **Paid Plans:**
  - Start at $0.015/GB storage
  - $0.01/GB bandwidth
  - Pay as you go

---

## Troubleshooting

**"Mux credentials not configured"**
- Make sure both `MUX_TOKEN_ID` and `MUX_TOKEN_SECRET` are set
- Make sure they're set for **Production** environment
- Redeploy after adding variables

**"Upload failed"**
- Check that Token ID and Secret are correct (no extra spaces)
- Verify tokens are active in Mux dashboard
- Check browser console (F12) for error details

**"Token invalid"**
- Regenerate token in Mux dashboard
- Update Vercel environment variables
- Redeploy

---

## Quick Checklist

- [ ] Mux account created
- [ ] API token generated
- [ ] Token ID copied
- [ ] Token Secret copied
- [ ] `MUX_TOKEN_ID` added to Vercel
- [ ] `MUX_TOKEN_SECRET` added to Vercel
- [ ] Vercel project redeployed
- [ ] Test upload works

---

## Alternative: Use Cloudinary Instead

If you prefer Cloudinary:

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Get credentials from Dashboard
3. Add to Vercel:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

The code will try Mux first, then fall back to Cloudinary if Mux isn't configured.

