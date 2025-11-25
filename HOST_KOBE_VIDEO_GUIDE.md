# 🎬 How to Host a Video on /heaven/kobe-bryant

## 📍 Quick Answer: **3 Easy Methods**

---

## **Method 1: Use the Page Directly (EASIEST - No Setup Needed)**

### Steps:
1. **Go to:** https://dashmemories.com/heaven/kobe-bryant
2. **Upload your video:**
   - **Option A:** Paste a video URL (Google Drive, Dropbox, Mux, etc.)
     - Paste URL in the text field
     - Click "Use Video URL"
   - **Option B:** Upload a video file
     - Click "📹 Upload Video File"
     - Select your video (max 500MB)
     - It will upload to permanent storage (Mux/Cloudinary)
3. **Done!** The video will save and play automatically

**Note:** This saves to localStorage (browser-specific) or Supabase (if connected).

---

## **Method 2: Set Environment Variable (PERMANENT - Works for Everyone)**

### Steps:
1. **Get your video URL:**
   - Upload video to: Google Drive, Dropbox, Mux, Cloudinary, or any video host
   - Get the **direct video URL** (must be a direct link to the video file)

2. **Add to Vercel:**
   - Go to: https://vercel.com/dashboard
   - Select your project: `nextjs-auth-app` (or `DASH`)
   - Go to: **Settings** → **Environment Variables**
   - Click: **Add New**
   - **Key:** `NEXT_PUBLIC_KOBE_DEMO_VIDEO`
   - **Value:** Your video URL (e.g., `https://drive.google.com/uc?export=download&id=FILE_ID`)
   - **Environment:** Select all (Production, Preview, Development)
   - Click: **Save**

3. **Redeploy:**
   - Go to: **Deployments** tab
   - Click the **3 dots** on the latest deployment
   - Click: **Redeploy**

4. **Done!** Video will now load for everyone.

---

## **Method 3: Use API Endpoint (PROGRAMMATIC)**

### Use the `/api/heaven/set-video-url` endpoint:

**Example Request:**
```bash
curl -X POST https://dashmemories.com/api/heaven/set-video-url \
  -H "Content-Type: application/json" \
  -d '{
    "name": "kobe-bryant",
    "videoUrl": "https://your-video-url.com/video.mp4",
    "uploadToMux": false
  }'
```

This will:
- Save the URL to Supabase (if connected)
- Save to localStorage as backup
- Work immediately without redeploy

---

## 📋 Video URL Requirements

### ✅ **Good URLs:**
- Google Drive: `https://drive.google.com/uc?export=download&id=FILE_ID`
- Dropbox: `https://www.dropbox.com/s/FILE_ID/video.mp4?dl=1`
- Mux: `https://stream.mux.com/PLAYBACK_ID.m3u8`
- Direct video links: `https://example.com/video.mp4`

### ❌ **Bad URLs:**
- YouTube share links (not direct video files)
- Private/restricted links requiring login
- Links that expire

---

## 🎯 Recommended: Method 2 (Environment Variable)

**Why?**
- ✅ Permanent (won't be lost)
- ✅ Works for all users
- ✅ No dependency on Supabase
- ✅ Fast loading

**Steps Summary:**
1. Get video URL
2. Add `NEXT_PUBLIC_KOBE_DEMO_VIDEO` to Vercel
3. Redeploy

---

## 🔧 Troubleshooting

**Video not loading?**
- Check console (F12) for errors
- Verify URL is direct link to video file
- Make sure URL is accessible (not private)

**Need help?**
- Test the page: https://dashmemories.com/heaven/kobe-bryant
- Check browser console for debug info
- The page shows priority order in console logs

