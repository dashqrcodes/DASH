# Fresh Setup: Kobe Bryant Video Environment Variable

## Step-by-Step: Create New Environment Variable

### Step 1: Go to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign in
3. Select your **DASH** project
4. Click **Settings** (top menu)
5. Click **Environment Variables** (left sidebar)

### Step 2: Create New Variable
1. Click **"Add New"** button (top right)
2. Fill in:

**Key (exactly as shown):**
```
NEXT_PUBLIC_KOBE_DEMO_VIDEO
```

**Value (paste this exactly):**
```
https://drive.google.com/uc?export=download&id=1mwXwubTJtD8yopRTzTm7MMoShV25JO62
```

**Environments (check all three):**
- ☑ Production
- ☑ Preview
- ☑ Development

3. Click **"Save"**

### Step 3: Verify It Was Created
You should see:
- `NEXT_PUBLIC_KOBE_DEMO_VIDEO` in the list
- Value should show (masked)
- All three environments checked

### Step 4: Redeploy (IMPORTANT!)
1. Go to **Deployments** tab (top menu)
2. Find the **latest deployment**
3. Click the **"..."** (three dots) on the right
4. Click **"Redeploy"**
5. **IMPORTANT:** Make sure **"Use existing Build Cache"** is **UNCHECKED**
6. Click **"Redeploy"**
7. Wait 1-2 minutes for build to complete

### Step 5: Test
1. Visit: `https://dashmemories.com/heaven/kobe-bryant`
2. Your video should load!

---

## Troubleshooting

**Video still not showing?**
1. Check Vercel logs:
   - Deployments → Latest → Logs
   - Look for any errors

2. Verify environment variable:
   - Settings → Environment Variables
   - Make sure `NEXT_PUBLIC_KOBE_DEMO_VIDEO` exists
   - Make sure it's checked for **Production**

3. Hard refresh browser:
   - Chrome/Edge: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Safari: Cmd+Option+R

4. Check browser console (F12):
   - Look for errors loading the video
   - Check Network tab for failed requests

---

## Quick Reference

**Variable Name:**
```
NEXT_PUBLIC_KOBE_DEMO_VIDEO
```

**Variable Value:**
```
https://drive.google.com/uc?export=download&id=1mwXwubTJtD8yopRTzTm7MMoShV25JO62
```

**Test URL:**
```
https://dashmemories.com/heaven/kobe-bryant
```

---

## Still Not Working?

**Check:**
1. Did you redeploy after adding the variable?
2. Is the variable set for **Production** environment?
3. Is the Google Drive link publicly accessible?
4. Try the test endpoint: `https://dashmemories.com/api/test-mux` (should show Mux is configured)

**Tell me:**
- What do you see when you visit the Kobe page?
- Any errors in browser console (F12)?
- What do Vercel logs show?


