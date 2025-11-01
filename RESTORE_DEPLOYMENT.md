# How to Retrieve/Restore Deleted Deployments on Vercel

## Quick Answer

**Yes, you can restore deleted deployments within 30 days!**

## Step-by-Step Guide

### 1. Access Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Navigate to your project dashboard
3. Click on your project name (e.g., `nextjs-auth-app`)

### 2. Navigate to Security Settings

1. Click on the **"Settings"** tab (top navigation)
2. In the left sidebar, click **"Security"**
3. Scroll down to find the **"Recently Deleted"** section

### 3. Find and Restore the Deployment

1. In the **"Recently Deleted"** section, you'll see a list of deleted deployments
2. Each deployment will show:
   - Deployment URL
   - Deletion date
   - Commit message (if available)
3. Find the deployment you want to restore
4. Click the **"Restore"** button next to it
5. Confirm the restoration

### 4. After Restoration

Once restored:
- ✅ The deployment will be available again
- ✅ All chunks and static assets will be restored
- ✅ The deployment URL will work again
- ⚠️ **Note**: This restores the deployment, but it won't automatically become your production deployment

### Important Notes

**Time Limit:**
- Deployments can only be restored within **30 days** of deletion
- After 30 days, they're permanently deleted and cannot be recovered

**What Gets Restored:**
- ✅ All static files and chunks
- ✅ The deployment URL
- ✅ Build artifacts
- ❌ Environment variables (they're project-level, not deployment-specific)

**Deployment Status:**
- Restored deployments are typically set to "Preview" status
- You may need to promote it to production if needed

## Alternative: View Deployment History

If you just want to see what was deployed (but not restore):

1. Go to your project dashboard
2. Click on the **"Deployments"** tab
3. You'll see deployment history (including deleted ones with indicators)
4. Click on a deleted deployment to see details (but may not be accessible)

## Preventing Future Issues

Instead of relying on restoring deployments, use these practices:

1. **Use Production Domain:**
   - Always use your custom domain (e.g., `yourdomain.com`)
   - Production domains always point to the latest deployment

2. **Use Auto-Detection:**
   - Use `VERCEL_URL` environment variable (automatic)
   - Use `getBaseUrl()` utility (already implemented in your code)

3. **Longer Retention:**
   - In Vercel project settings → Deployments
   - Configure retention policies for longer periods
   - Hobby: 30 days, Pro: 90 days, Enterprise: Custom

## Quick Checklist

- [ ] Go to Vercel Dashboard → Your Project
- [ ] Settings → Security
- [ ] Scroll to "Recently Deleted"
- [ ] Find your deployment
- [ ] Click "Restore"
- [ ] Confirm restoration
- [ ] Update environment variables if needed
- [ ] Test the restored deployment

## If You Can't Find It

**The deployment might be permanently deleted if:**
- It was deleted more than 30 days ago
- It was manually purged
- The project was deleted

**In that case:**
- You'll need to create a new deployment
- Use `git push` to trigger a fresh build
- The new deployment will have new chunk files

## Related to Your Current Issue

For your `DEPLOYMENT_DELETED` and missing chunk errors:

1. **Option A: Restore the deployment** (if within 30 days)
   - Follow steps above
   - This will restore the chunks temporarily

2. **Option B: Create fresh deployment** (Recommended)
   - Use the fixes we already implemented
   - Deploy fresh code with `getBaseUrl()` utility
   - This prevents the issue from recurring

**We recommend Option B** because:
- The fixes we implemented solve the root cause
- Fresh deployment with new chunks is cleaner
- Prevents future issues

