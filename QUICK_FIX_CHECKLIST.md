# Quick Fix Checklist for DEPLOYMENT_DELETED Error

## ✅ Code Changes Applied

1. ✅ Created `src/utils/getBaseUrl.ts` - Utility function for automatic URL detection
2. ✅ Updated `src/pages/api/spotify/auth.ts` - Now uses `getBaseUrl()`
3. ✅ Updated `src/pages/api/spotify/callback.ts` - Now uses `getBaseUrl()`

## 🔧 Next Steps (Required)

### 1. Update Vercel Environment Variables

**In Vercel Dashboard:**
1. Go to your project → Settings → Environment Variables
2. Check `NEXT_PUBLIC_BASE_URL`:
   - ❌ **If it's set to a deployment URL** (like `https://nextjs-auth-app-abc123.vercel.app`):
     - **Option A**: Delete it (let Vercel auto-detect via `VERCEL_URL`)
     - **Option B**: Set it to your production domain (e.g., `https://yourdomain.com`)
   - ✅ **If it's set to your production domain**: Keep it as is

### 2. Update Spotify Dashboard Redirect URIs

**Critical:** Spotify requires exact redirect URI matches.

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Select your app
3. Click "Edit Settings"
4. Add these redirect URIs:

   **If you have a custom domain:**
   ```
   https://yourdomain.com/api/spotify/callback
   ```

   **If you're using Vercel's default domain:**
   ```
   https://nextjs-auth-app.vercel.app/api/spotify/callback
   ```

   **For development:**
   ```
   http://localhost:3000/api/spotify/callback
   ```

   **Important:** Remove any deployment-specific URLs like:
   - ❌ `https://nextjs-auth-app-xyz123.vercel.app/api/spotify/callback`

### 3. Verify the Fix

After deploying:
1. Check that the app loads correctly
2. Test Spotify OAuth flow
3. Verify no `DEPLOYMENT_DELETED` errors in Vercel logs

## 🎯 How It Works Now

The new `getBaseUrl()` function:
1. **First checks** `VERCEL_URL` (automatically provided by Vercel - always current)
2. **Then checks** `NEXT_PUBLIC_BASE_URL` (your production domain if configured)
3. **Falls back to** `localhost:3000` for development

This ensures:
- ✅ Always uses the current active deployment
- ✅ Never references deleted deployments
- ✅ Works in all environments (dev, preview, production)

## 📚 Additional Resources

- See `DEPLOYMENT_DELETED_FIX.md` for detailed explanation
- [Vercel Environment Variables Docs](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vercel Deployment Retention](https://vercel.com/docs/concepts/deployments/deployment-retention)

