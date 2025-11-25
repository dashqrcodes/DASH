# 🚨 Fix "No video available" Error for Kobe Bryant

## The Problem
When you scan the QR code for `https://dashmemories.com/heaven/kobe-bryant`, you see:
> "No video available. Please set a video URL via environment variable or Supabase"

## Why This Happens
The page looks for the video in this order:
1. ❌ Environment variable `NEXT_PUBLIC_KOBE_DEMO_VIDEO` (not set)
2. ❌ Supabase database (not configured yet - missing env vars)
3. ❌ localStorage (empty)
4. ❌ Default config (empty)

## ✅ Solution: Two Options

### Option 1: Set Video in Supabase (Recommended - Works Once Supabase is Configured)

**Step 1: Set Up Supabase First**
- Follow `ADD_SUPABASE_ENV_VARS_STEP_BY_STEP.md` to add environment variables to Vercel
- This is required for Supabase to work

**Step 2: Run SQL Script**
1. Go to **Supabase Dashboard** → **SQL Editor**
2. Open the file: `SET_KOBE_VIDEO_URL_NOW.sql`
3. Copy the entire script
4. Paste into Supabase SQL Editor
5. Click **"Run"** or press `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)
6. Verify you see 2 rows in the results

**Step 3: Test**
- Visit: `https://dashmemories.com/heaven/kobe-bryant`
- The video should now load! ✅

---

### Option 2: Set Environment Variable (Quick Fix - Works Immediately After Redeploy)

**Step 1: Add Environment Variable to Vercel**
1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Click **"Add New"**
3. Fill in:
   - **Key:** `NEXT_PUBLIC_KOBE_DEMO_VIDEO`
   - **Value:** `https://www.dashqrcodes.com/heaven-kobe-bryant`
   - **Environments:** ☑️ Production ☑️ Preview ☑️ Development
4. Click **"Save"**

**Step 2: Redeploy**
1. Go to **Deployments** tab
2. Click **"⋯"** on latest deployment
3. Click **"Redeploy"**
4. Wait for deployment to complete (1-2 minutes)

**Step 3: Test**
- Visit: `https://dashmemories.com/heaven/kobe-bryant`
- The video should now load! ✅

---

## 🎯 Recommended Approach

**Do BOTH:**
1. ✅ Add environment variable (works immediately after redeploy)
2. ✅ Set video in Supabase (works once Supabase env vars are added)

This ensures the video works:
- **Now** (via environment variable)
- **Later** (via Supabase, even if env var is removed)

---

## 🔍 Verify It's Working

After either solution:

1. Visit: `https://dashmemories.com/heaven/kobe-bryant`
2. You should see the video playing (not the "No video available" message)
3. Check browser console (F12) - should see:
   ```
   ✅ Video URL set: https://www.dashqrcodes.com/heaven-kobe-bryant
   ```

---

## 🆘 Still Not Working?

**If you used Option 1 (Supabase):**
- Make sure you added `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to Vercel
- Make sure you redeployed after adding those variables
- Check: `https://dashmemories.com/api/test-heaven-supabase` - should show `"success": true`

**If you used Option 2 (Environment Variable):**
- Make sure you redeployed after adding the variable
- Check Vercel deployment logs for any errors
- Verify the variable name is exactly: `NEXT_PUBLIC_KOBE_DEMO_VIDEO` (case-sensitive)

---

## 📝 Quick Checklist

- [ ] Added Supabase env vars to Vercel (if using Option 1)
- [ ] Ran SQL script in Supabase (if using Option 1)
- [ ] Added `NEXT_PUBLIC_KOBE_DEMO_VIDEO` to Vercel (if using Option 2)
- [ ] Redeployed project
- [ ] Tested: `https://dashmemories.com/heaven/kobe-bryant`
- [ ] Video loads successfully ✅

