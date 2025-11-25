# 🚀 Set Kobe Video NOW - 3 Steps

## The Problem
You're seeing: "No video available. Please set a video URL via environment variable or Supabase"

## The Solution (3 Steps)

### Step 1: Open Vercel Environment Variables
1. Go to: **https://vercel.com/dashboard**
2. Click on your project
3. Click **Settings** tab (at the top)
4. Click **Environment Variables** (in left sidebar)

### Step 2: Add the Video URL
1. Click **"Add New"** button
2. Fill in exactly:

   **Key (copy this exactly):**
   ```
   NEXT_PUBLIC_KOBE_DEMO_VIDEO
   ```

   **Value (copy this exactly):**
   ```
   https://www.dashqrcodes.com/heaven-kobe-bryant
   ```

   **Check these boxes:**
   - ☑️ Production
   - ☑️ Preview
   - ☑️ Development

3. Click **"Save"**

### Step 3: Redeploy
1. Click **"Deployments"** tab (at the top)
2. Find the latest deployment
3. Click **"⋯"** (three dots) on the right
4. Click **"Redeploy"**
5. Wait 1-2 minutes for it to finish

### Step 4: Test
Visit: **https://dashmemories.com/heaven/kobe-bryant**

You should see the video playing! ✅

---

## 🎯 Quick Copy-Paste Checklist

**In Vercel Environment Variables:**
- Key: `NEXT_PUBLIC_KOBE_DEMO_VIDEO`
- Value: `https://www.dashqrcodes.com/heaven-kobe-bryant`
- Environments: Production, Preview, Development

**Then:**
- Redeploy
- Test: `https://dashmemories.com/heaven/kobe-bryant`

---

## 🆘 Still Not Working?

1. **Did you redeploy?** The variable won't work until you redeploy!
2. **Check the variable name:** Must be exactly `NEXT_PUBLIC_KOBE_DEMO_VIDEO` (case-sensitive)
3. **Check all environments are checked:** Production, Preview, Development
4. **Wait a minute:** After redeploy, wait 1-2 minutes for changes to propagate

---

## 📸 What It Should Look Like

After setting the variable and redeploying, when you visit `https://dashmemories.com/heaven/kobe-bryant`, you should see:
- ✅ A video playing in fullscreen (not the "No video available" message)
- ✅ The video from `https://www.dashqrcodes.com/heaven-kobe-bryant`

