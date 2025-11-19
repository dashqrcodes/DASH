# 🌐 Setting Up dashqrcodes.com

## Overview
Set up `dashqrcodes.com` to showcase DASH and link to your Netcapital fundraising page.

## Step 1: Add Domain in Vercel

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Select your project (nextjs-auth-app)
   - Go to **Settings** → **Domains**

2. **Add Custom Domain**
   - Click **"Add Domain"**
   - Enter: `dashqrcodes.com`
   - Click **"Add"**

3. **Copy DNS Records**
   - Vercel will show you DNS records to add
   - Same format as dashmemories.com:
     - A Record: `@` → [Vercel IP]
     - CNAME Record: `www` → [Vercel CNAME]

## Step 2: Configure DNS

**Wherever dashqrcodes.com is registered:**

1. Go to DNS settings
2. Add the same DNS records as dashmemories.com:
   - **A Record**: `@` → [Same Vercel IP as dashmemories.com]
   - **CNAME Record**: `www` → [Same Vercel CNAME as dashmemories.com]
3. Save

## Step 3: Create Landing Page

**Option A: Investment Landing Page (Recommended)**
- Created `/invest` page that links to Netcapital
- Visit: `https://dashqrcodes.com/invest`
- Beautiful landing page with investment info
- Links to: https://netcapital.com/companies/dash

**Option B: Homepage Redirect**
- Make homepage redirect to Netcapital
- Or show investment landing page

## Step 4: Update Homepage (Optional)

You can make `dashqrcodes.com` homepage show the investment page:

1. Update `src/pages/index.tsx` to detect domain
2. If `dashqrcodes.com`, show investment page
3. If `dashmemories.com`, show normal app

## URLs That Will Work

Once set up:
- `https://dashqrcodes.com` - Homepage
- `https://dashqrcodes.com/invest` - Investment landing page
- `https://dashqrcodes.com/heaven/kobe-bryant` - All app routes work
- `https://dashqrcodes.com/account` - User dashboard
- All routes work on both domains

## Quick Setup

1. Add `dashqrcodes.com` in Vercel (2 min)
2. Configure DNS (5 min)
3. Wait 15-30 minutes for DNS propagation
4. Visit `https://dashqrcodes.com/invest` to see investment page

---

**Note:** Both `dashmemories.com` and `dashqrcodes.com` will point to the same app, so all features work on both domains!

