# 🚀 Vercel Deployment Checklist for Tomorrow Night

## ✅ Can It Run? YES - With These Steps

The app **CAN run on Vercel** but needs environment variables configured. Here's what you need:

---

## 🔴 CRITICAL (Must Have)

### 1. **Supabase Environment Variables** (Recommended but Optional)
The app has null guards, so it will work without Supabase, but features will be limited.

**In Vercel Dashboard → Settings → Environment Variables:**

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**How to get these:**
1. Go to Supabase Dashboard → Settings → API
2. Copy "Project URL" → `NEXT_PUBLIC_SUPABASE_URL`
3. Copy "anon/public key" → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Select environments:** ✅ Production, ✅ Preview, ✅ Development

---

### 2. **Base URL** (Auto-detected, but can set manually)

```
NEXT_PUBLIC_BASE_URL=https://dashmemories.com
```

**OR** leave it unset - Vercel auto-detects via `VERCEL_URL` ✅

---

## 🟡 OPTIONAL (Nice to Have)

### 3. **Spotify Integration** (Optional)
Only needed if you want music features to work:

```
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
```

**How to get:**
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create app → Copy Client ID and Secret

---

### 4. **HEAVEN Demo Upload** (Optional)
Only needed for secure demo video uploads:

```
HEAVEN_DEMO_UPLOAD_SECRET=your_secret_key_here
```

---

## ✅ Pre-Deployment Steps

### Step 1: Test Build Locally
```bash
npm run build
```

If this succeeds, Vercel will succeed too! ✅

### Step 2: Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 3: Configure Vercel

1. **Go to Vercel Dashboard**
2. **Select your project** (or create new one)
3. **Settings → Environment Variables**
4. **Add the variables above**
5. **Redeploy** (or push to trigger auto-deploy)

---

## 🎯 What Works Without Supabase

✅ **Will Work:**
- Homepage and routing
- Sign up / Sign in pages
- Slideshow UI (uses localStorage)
- Profile creation
- Basic navigation
- All UI components

❌ **Won't Work:**
- Permanent data storage (uses localStorage only)
- Cloud photo/video storage
- Cross-device sync
- Long-term persistence

---

## 🚨 Quick Fixes if Build Fails

### Error: "supabaseKey is required"
✅ **Already fixed!** The code has null guards - it will build even without Supabase keys.

### Error: "Module not found"
```bash
npm install
npm run build
```

### Error: TypeScript errors
Check `tsconfig.json` - should be fine, but verify.

---

## 📋 Final Checklist Before Tomorrow Night

- [ ] Run `npm run build` locally - should succeed
- [ ] Push latest code to GitHub
- [ ] Add `NEXT_PUBLIC_SUPABASE_URL` to Vercel (if using Supabase)
- [ ] Add `NEXT_PUBLIC_SUPABASE_ANON_KEY` to Vercel (if using Supabase)
- [ ] Set `NEXT_PUBLIC_BASE_URL` to `https://dashmemories.com` (or leave unset)
- [ ] Deploy to Vercel (auto-deploys on push, or manual deploy)
- [ ] Test homepage loads: `https://dashmemories.com`
- [ ] Test slideshow page works
- [ ] Verify no console errors

---

## 🎉 Success Criteria

✅ **Website is "live" if:**
1. Homepage loads without errors
2. Navigation works
3. Slideshow page displays
4. No critical console errors

**Even if Supabase isn't configured**, the app will work in "localStorage mode" - perfect for demos!

---

## 🆘 Emergency Fallback

**If something breaks:**
1. Check Vercel build logs
2. Verify environment variables are set
3. The app has null guards - it should work even with missing vars
4. Worst case: Remove Supabase vars temporarily, deploy, add them back

---

## ⚡ Quick Deploy Command

```bash
# 1. Build test
npm run build

# 2. If successful, push
git add .
git commit -m "Deploy ready"
git push origin main

# 3. Vercel auto-deploys! 🚀
```

---

**Bottom Line:** ✅ **YES, it can run tomorrow night!** Just add the environment variables in Vercel and push to GitHub. The app is designed to work even without Supabase (uses localStorage as fallback).


