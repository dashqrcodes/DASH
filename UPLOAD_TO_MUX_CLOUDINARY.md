# Upload Demo Videos to Mux/Cloudinary

## We Already Have Mux & Cloudinary! 🎉

You don't need Google Drive or Dropbox. We can upload directly to **Mux** (best for videos) or **Cloudinary** (fallback).

## Method 1: Upload via API (Recommended)

I just created a new API endpoint that uses Mux/Cloudinary. Here's how to use it:

### Step 1: Make Sure Credentials Are Set in Vercel

Go to **Vercel Dashboard** → **Settings** → **Environment Variables** and add:

**For Mux (Best for Videos):**
```
MUX_TOKEN_ID = [Your Mux Token ID]
MUX_TOKEN_SECRET = [Your Mux Token Secret]
```

**For Cloudinary (Fallback):**
```
CLOUDINARY_CLOUD_NAME = [Your Cloud Name]
CLOUDINARY_API_KEY = [Your API Key]
CLOUDINARY_API_SECRET = [Your API Secret]
```

### Step 2: Upload from Your iPhone

**Option A: Use the Website Upload (Easiest)**

1. Go to `https://dashmemories.com/heaven/kobe-bryant` on your iPhone
2. Click **"📹 Upload Video File"**
3. Select your video
4. The video will upload to Mux/Cloudinary automatically!

**Option B: Use the API Directly**

You can use a tool like Postman or curl, or I can create a simple upload page for you.

### Step 3: Get the Video URL

After upload, you'll get back:
- **Mux**: `https://stream.mux.com/[playback-id].m3u8`
- **Cloudinary**: `https://res.cloudinary.com/.../video.mp4`

### Step 4: Add to Environment Variables

Once you have the video URL, add it to Vercel:

```
NEXT_PUBLIC_KOBE_DEMO_VIDEO = [The video URL from step 3]
NEXT_PUBLIC_KELLY_DEMO_VIDEO = [The video URL from step 3]
```

---

## Method 2: Upload via HEAVEN Demo Page (Already Works!)

The demo pages already have upload functionality:

1. Visit `https://dashmemories.com/heaven/kobe-bryant`
2. Click **"📹 Upload Video File"**
3. Select video from your iPhone
4. Video uploads and plays automatically

**Note:** Currently this saves to localStorage. We can update it to use Mux/Cloudinary instead!

---

## What I Just Created

I created a new API endpoint: `/api/heaven/upload-to-mux`

This endpoint:
- ✅ Tries Mux first (best for video streaming)
- ✅ Falls back to Cloudinary if Mux isn't configured
- ✅ Handles large files (up to 500MB)
- ✅ Returns the video URL for use in environment variables

---

## Next Steps

**Option 1: Use Existing Upload (Quick)**
- Just upload via the website - it works now!

**Option 2: Use Mux/Cloudinary (Best Quality)**
1. Set up Mux or Cloudinary credentials in Vercel
2. Upload via the API endpoint
3. Get the video URL
4. Add to environment variables

**Option 3: I Can Update the Upload Page**
- I can modify the HEAVEN demo page upload to use Mux/Cloudinary instead of localStorage
- This way it's permanent and works for everyone

Which option do you prefer?

---

## Getting Mux/Cloudinary Credentials

**Mux:**
1. Sign up at [mux.com](https://mux.com)
2. Go to Settings → API Tokens
3. Create a new token
4. Copy Token ID and Token Secret

**Cloudinary:**
1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Go to Dashboard
3. Copy Cloud Name, API Key, and API Secret


