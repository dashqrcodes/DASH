# Step-by-Step Guide: Save Code to GitHub & Deploy to Vercel

## ✅ Step 1: GitHub - COMPLETED

Your code has been successfully pushed to GitHub:
- **Repository**: `https://github.com/dashqrcodes/DASH.git`
- **Branch**: `main`
- **Commit**: `8e69595` - Complete DASH app features

### Files Committed:
- ✅ 22 files changed
- ✅ 3,544 insertions
- ✅ New features: HEAVEN Convai integration, QR enhancements, Bible search, slideshow enhancements

---

## Step 2: Deploy to Vercel

### Option A: Automatic Deployment (Recommended)

If your GitHub repository is connected to Vercel:
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Your project should automatically deploy from GitHub
3. Check the "Deployments" tab for status

### Option B: Manual Deployment via CLI

Run these commands:

```bash
# 1. Login to Vercel (if not already logged in)
vercel login

# 2. Link to existing project or create new
vercel link

# 3. Deploy to production
vercel --prod
```

### Option C: Deploy via Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import from GitHub: `dashqrcodes/DASH`
4. Configure:
   - Framework Preset: Next.js
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
5. Add Environment Variables:
   - `CONVAI_API_KEY` = `0a9faf3d6122d1c4d3a06a5df6cf73ca`
   - Add any other required env vars
6. Click "Deploy"

---

## Step 3: Environment Variables Setup

**IMPORTANT**: Add these to Vercel Dashboard → Settings → Environment Variables:

### Required:
- `CONVAI_API_KEY` = `0a9faf3d6122d1c4d3a06a5df6cf73ca`

### Optional (add if needed):
- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`
- `NEXT_PUBLIC_BASE_URL` (your production domain)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
- `PRINT_SHOP_EMAIL` = `elartededavid@gmail.com`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

---

## Step 4: Verify Deployment

After deployment:
1. Check deployment status in Vercel dashboard
2. Visit your deployment URL (e.g., `https://dash-xxxxx.vercel.app`)
3. Test key features:
   - `/heaven` - HEAVEN Convai feature
   - `/memorial-card-builder-4x6` - Card builder
   - `/poster-builder` - Poster builder
   - `/slideshow` - Slideshow with enhancements

---

## Troubleshooting

**Build Fails:**
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Check for TypeScript errors

**Environment Variables Not Working:**
- Verify env vars are set in Vercel dashboard
- Redeploy after adding env vars
- Check variable names match exactly (case-sensitive)

**Convai API Errors:**
- Verify `CONVAI_API_KEY` is set correctly
- Check API key is active in Convai dashboard
- Review API rate limits

---

## Next Steps After Deployment

1. ✅ Set up custom domain (optional)
2. ✅ Enable analytics
3. ✅ Configure preview deployments
4. ✅ Set up monitoring and alerts

