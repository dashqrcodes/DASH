# Fix: "Build Canceled - Unverified Commit" Error

## Quick Fix

Vercel is blocking deployments because it requires verified commits. Here's how to disable it:

### Steps:

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Click your project: `nextjs-auth-app`

2. **Go to Settings:**
   - Click the "Settings" tab at the top

3. **Find Deployment Protection:**
   - In the left sidebar, click "Git"
   - Scroll down to find "Deployment Protection" section

4. **Disable Commit Verification:**
   - Look for: "Only deploy verified commits" or "Require verified commits"
   - **Turn this OFF** (toggle to disabled/unchecked)

5. **Save:**
   - Click "Save" if there's a save button

6. **Deploy Again:**
   - Go back to "Deployments" tab
   - Click "Create Deployment" again
   - This time it should work!

---

## Alternative: Redeploy Existing Deployment

If the setting change doesn't work immediately:

1. Go to "Deployments" tab
2. Find an older deployment that worked
3. Click "⋯" (three dots) menu
4. Click "Redeploy"
5. This bypasses the verification check

---

## Why This Happens

Vercel has a security feature that only allows verified/signed commits. Since our commits aren't GPG-signed, Vercel blocks them. Disabling this setting allows normal commits to deploy.

