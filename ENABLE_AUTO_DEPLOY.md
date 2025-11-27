# Enable Automatic Deployments (2 Minutes)

## The Kobe Video is Protected ✅

The Kobe video code is already safe:
- ✅ Hardcoded playback ID (won't break)
- ✅ Isolated code path (independent from other code)
- ✅ Direct iframe embed (most reliable method)
- ✅ No dependencies on APIs, env vars, or external services

**Your video will keep working!**

---

## Step 1: Disable GPG Verification in Vercel

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Click your project: `nextjs-auth-app`

2. **Open Settings:**
   - Click the **"Settings"** tab (top navigation)

3. **Go to Git Settings:**
   - In the left sidebar, click **"Git"**

4. **Scroll to Deployment Protection:**
   - Scroll down to find **"Deployment Protection"** section

5. **Disable Verification:**
   - Find **"Only deploy verified commits"** (or similar toggle)
   - **Turn it OFF** (disable/uncheck it)

6. **Save:**
   - Changes should auto-save (or click "Save" if there's a button)

---

## Step 2: Test Automatic Deployment

After disabling verification, make a test commit:

```bash
# Make a small test change
echo "# Auto-deploy test" >> README.md
git add README.md
git commit -m "Test: Automatic deployment"
git push origin main
```

**Then check Vercel:**
- Go to: https://vercel.com/dashboard → `nextjs-auth-app` → Deployments
- You should see a new deployment start automatically! 🚀

---

## After Setup Complete

✅ **Automatic deployments enabled:**
- Just push to GitHub: `git push origin main`
- Vercel automatically deploys (no CLI needed!)
- Kobe video stays working (it's protected)

✅ **No more manual steps:**
- No need to run `vercel --prod`
- Deployments happen automatically
- Professional workflow!

---

## If You Want GPG Signing Later (Optional)

If you want to enable GPG signing later for extra security:

1. Install GPG: `brew install gnupg`
2. Generate key: `gpg --full-generate-key`
3. Add to GitHub: Copy public key to GitHub settings
4. Configure Git: `git config --global commit.gpgsign true`
5. Re-enable verification in Vercel

But for now, disabling verification gets you automatic deployments immediately!

