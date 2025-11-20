# Check if Mux is Configured Correctly

## Quick Check

Since you already added Mux credentials, let's verify they're working:

### Step 1: Verify in Vercel

1. Go to **Vercel Dashboard** → Your DASH project
2. **Settings** → **Environment Variables**
3. Check these exist:
   - `MUX_TOKEN_ID` - Should have a value
   - `MUX_TOKEN_SECRET` - Should have a value
4. Make sure they're checked for **Production** environment

### Step 2: Check Vercel Logs

1. Go to **Deployments** tab
2. Click on the **latest deployment**
3. Click **"Logs"** tab
4. Look for: `Mux upload API loaded. Mux configured? true`
5. If it says `false`, the credentials aren't being read

### Step 3: Test Upload & Check Logs

1. Try uploading a video
2. Go to **Vercel** → **Deployments** → **Latest** → **Functions** tab
3. Click on the function that ran (should show the upload attempt)
4. Check the logs for:
   - `Mux configured? true/false`
   - `MUX_TOKEN_ID exists? true/false`
   - `MUX_TOKEN_SECRET exists? true/false`
   - Any error messages

### Step 4: Common Issues

**If logs show "Mux configured? false":**
- Credentials not set in Vercel
- Not set for Production environment
- Need to redeploy after adding

**If logs show "Mux configured? true" but upload fails:**
- Check Mux dashboard - is the token active?
- Check token permissions
- Try regenerating token

**If you see "Mux upload failed":**
- Check the error message in logs
- Verify token ID and Secret are correct (no extra spaces)
- Check Mux account limits (free tier has limits)

---

## Quick Fix: Force Redeploy

Sometimes Vercel needs a fresh deploy to pick up env vars:

1. Go to **Deployments**
2. Click **"..."** on latest
3. Click **"Redeploy"**
4. Make sure **"Use existing Build Cache"** is **UNCHECKED**
5. Redeploy

---

## Still Not Working?

**Check browser console (F12) when uploading:**
- What error message do you see?
- Check Network tab - what's the response from `/api/heaven/upload-to-mux`?

**Tell me:**
- What do the Vercel logs show?
- What error appears in browser console?
- Are the env vars definitely set in Vercel?


