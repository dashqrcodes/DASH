# How to Deploy Commits to Vercel

## Automatic Deployment (Should Already Work)

If your GitHub repo is connected to Vercel, deployments happen automatically when you push to `main`.

**Check if it's working:**
1. Go to: https://vercel.com/dashboard
2. Click on your project: `nextjs-auth-app`
3. Check the "Deployments" tab
4. You should see a new deployment starting automatically after a push

---

## Manual Deployment (If Automatic Isn't Working)

### Option 1: Redeploy from Vercel Dashboard

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Click on your project: `nextjs-auth-app`

2. **Find Your Latest Deployment:**
   - Go to the "Deployments" tab
   - Find the most recent deployment (even if it's old)

3. **Redeploy:**
   - Click the "⋯" (three dots) menu on the deployment
   - Click **"Redeploy"**
   - This will deploy the latest commit from GitHub

### Option 2: Create New Deployment

1. **Go to Deployments Tab:**
   - Visit: https://vercel.com/dashboard
   - Click on your project: `nextjs-auth-app`
   - Go to "Deployments" tab

2. **Click "Create Deployment":**
   - Click the big **"Create Deployment"** button (top right)

3. **Select Your Repository and Branch:**
   - Repository: `dashqrcodes/DASH`
   - Branch: `main`
   - Vercel will show you the latest commits

4. **Select the Commit:**
   - Choose commit: `0a536a5` (latest) or any commit you want
   - Or just select "Latest" from `main` branch

5. **Click "Deploy"**
   - Vercel will build and deploy your app

---

## Verify Deployment Status

### Check in Vercel:
1. Go to: https://vercel.com/david-gastelums-projects/nextjs-auth-app/deployments
2. Look for a deployment with status:
   - 🟡 **Building** = Currently deploying
   - 🟢 **Ready** = Successfully deployed
   - 🔴 **Error** = Something went wrong (click to see logs)

### Check the URL:
- Production URL: https://dashmemories.com/heaven/kobe-bryant
- Vercel Preview URL: Check the deployment details for preview URL

---

## If Deployments Still Don't Show Up

### Check GitHub Integration:
1. Go to Vercel: Settings → Git
2. Verify:
   - ✅ Repository is connected: `dashqrcodes/DASH`
   - ✅ Production branch is set to: `main`
   - ✅ "Automatic deployments" is enabled

### Check GitHub Webhooks:
1. Go to: https://github.com/dashqrcodes/DASH/settings/hooks
2. Look for a Vercel webhook
3. If missing, Vercel integration might be broken - reconnect it

---

## Quick Summary

**Fastest way right now:**
1. Go to: https://vercel.com/dashboard
2. Click: `nextjs-auth-app` project
3. Click: "Deployments" tab
4. Click: "Create Deployment" button
5. Select: `main` branch
6. Click: "Deploy"

**Latest commits to deploy:**
- `0a536a5` - "Fix: Use direct Mux iframe embed for reliable Kobe video playback" (NEWEST)
- `57a9358` - "Trigger deployment: Fix video playback with MuxPlayerWrapper"

