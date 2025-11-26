# 📤 Upload Video from Laptop - Get Working URL

## 🎯 Goal

Upload your video file from your laptop to get a direct video file URL that works!

---

## ✅ Option 1: Upload to Mux (Best for Videos) ⭐ Recommended

### Step 1: Get Mux Credentials

1. Go to: **https://mux.com**
2. Sign up / Log in
3. Go to **Settings** → **API Access Tokens**
4. Create a new token
5. Copy your **Token ID** and **Token Secret**

### Step 2: Add to Vercel

1. Go to: `https://vercel.com/david-gastelums-projects/nextjs-auth-app/settings/environment-variables`
2. Add:
   - **Key:** `MUX_TOKEN_ID`
   - **Value:** (your Mux token ID)
   - **Production only**
3. Add:
   - **Key:** `MUX_TOKEN_SECRET`
   - **Value:** (your Mux token secret)
   - **Production only**

### Step 3: Upload via API

**I can create an upload endpoint, OR:**

**Use Mux Dashboard:**
1. Go to Mux Dashboard → **Assets**
2. Click **"Upload"**
3. Select your video file
4. Wait for upload
5. Copy the **Playback ID**
6. Your video URL: `https://stream.mux.com/{PLAYBACK_ID}.m3u8`

---

## ✅ Option 2: Upload to Cloudinary (Easy & Free)

### Step 1: Get Cloudinary Account

1. Go to: **https://cloudinary.com**
2. Sign up (free tier available)
3. Go to **Dashboard**
4. Copy your **Cloud Name**, **API Key**, **API Secret**

### Step 2: Upload Video

**Method A: Via Dashboard**
1. Go to Cloudinary Dashboard → **Media Library**
2. Click **"Upload"**
3. Select your video file
4. Wait for upload
5. Copy the **URL** (it will be like `https://res.cloudinary.com/.../video.mp4`)

**Method B: Via API (I can help set this up)**

---

## ✅ Option 3: Upload to Supabase Storage (You Already Have This!)

### Step 1: Upload to Supabase

1. Go to: **https://app.supabase.com**
2. Select your project
3. Go to **Storage** → **Buckets**
4. Create bucket `heaven-videos` (if doesn't exist)
5. Click **"Upload"**
6. Select your video file
7. Wait for upload
8. Click on the file
9. Copy the **Public URL**

**Your video URL will be:**
```
https://{your-project}.supabase.co/storage/v1/object/public/heaven-videos/kobe-bryant.mp4
```

---

## ✅ Option 4: Use Existing Video Hosting

**If you already have the video hosted somewhere:**
- Just get the direct video file URL
- Paste it in the environment variable
- Done!

---

## 🎯 Quickest Method: Supabase Storage

**Since you already have Supabase set up:**

1. **Go to Supabase Dashboard**
2. **Storage** → **Buckets**
3. **Create bucket** (if needed): `heaven-videos`
4. **Make it public** (so videos can be accessed)
5. **Upload your video file**
6. **Copy the public URL**
7. **Use that URL in Vercel environment variable**

**This is the fastest since you already have Supabase!**

---

## 📋 Step-by-Step: Supabase Upload

### Step 1: Create Bucket

1. Go to: **https://app.supabase.com** → Your Project
2. Click **Storage** (left sidebar)
3. Click **"New bucket"**
4. Name: `heaven-videos`
5. **Make it public** (check "Public bucket")
6. Click **"Create bucket"**

### Step 2: Upload Video

1. Click on `heaven-videos` bucket
2. Click **"Upload file"**
3. Select your Kobe video file
4. Wait for upload
5. Click on the uploaded file
6. Copy the **Public URL**

### Step 3: Use the URL

1. Go to Vercel Environment Variables
2. Edit `NEXT_PUBLIC_KOBE_DEMO_VIDEO`
3. Paste the Supabase public URL
4. Save
5. Redeploy

---

## 🎯 What Video File Do You Have?

**Tell me:**
- What's the filename? (e.g., `kobe-bryant.mp4`)
- How big is it? (file size)
- What format? (.mp4, .mov, etc.)

**I can help you upload it to the best service!**

---

## ✅ Recommended: Supabase Storage

**Why:**
- ✅ You already have Supabase set up
- ✅ Free tier available
- ✅ Direct video file URLs
- ✅ Easy to manage
- ✅ Fast upload

**Just upload to Supabase Storage and use the public URL!**

---

## 🚀 Quick Steps

1. **Upload video to Supabase Storage**
2. **Get public URL**
3. **Paste in Vercel environment variable**
4. **Redeploy**
5. **Done!** ✅

**Want me to walk you through the Supabase upload step-by-step?**

