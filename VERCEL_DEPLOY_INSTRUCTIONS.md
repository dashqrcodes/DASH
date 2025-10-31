# 🚀 VERCEL DEPLOYMENT - FINAL STEPS

## You're on the right page! Here's what to do:

### Step 1: Configure Project
On the Vercel import page:

1. **Project Name**: Keep as "DASH" or change to "dash"
2. **Framework Preset**: Should auto-detect **Next.js** ✅
3. **Root Directory**: Leave as is (should be `/`)
4. **Build Command**: Leave as is (auto-detects)
5. **Output Directory**: Leave as is (auto-detects)

### Step 2: Add Environment Variables (IMPORTANT!)
Scroll down to "Environment Variables" section and ADD:

**Click "Add More" for each:**

1. Key: `CLOUDINARY_URL`
   Value: `cloudinary://936793599379724:Tejbnin77Rb6AE2Am5g8CvMSF3s@djepgisuk`

2. Key: `CLOUDINARY_CLOUD_NAME`
   Value: `djepgisuk`

3. Key: `CLOUDINARY_API_KEY`
   Value: `936793599379724`

4. Key: `CLOUDINARY_API_SECRET`
   Value: `Tejbnin77Rb6AE2Am5g8CvMSF3s`

5. Key: `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   Value: `djepgisuk`

6. Key: `NEXT_PUBLIC_SUPABASE_URL`
   Value: `https://urnkszyyabomkpujkzo.supabase.co`

7. Key: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVybmtzenlieWFib21rcHVqa3pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyNzM2MTcsImV4cCI6MjA3Njg0OTYxN30.TqwxERGGqOPBlwlhyidUmZ2ktFFaLT2FMfZvreicNt4`

### Step 3: Deploy!
Click the big **"Deploy"** button at the bottom!

### Step 4: Wait 2-3 Minutes
Vercel will:
- Install dependencies
- Build your Next.js app
- Deploy to production
- Give you a URL like: `dash.vercel.app`

### Step 5: Connect Domain (dashmemories.com)
After deployment succeeds:
1. Go to Project Settings → Domains
2. Add: `dashmemories.com`
3. Follow DNS instructions
4. Update GoDaddy

🎉 THAT'S IT! You'll be live!
