# 🎬 Kobe Video Setup - Complete Guide

## 📍 Current Setup

The Kobe video is displayed on:
- `/heaven` - Main heaven page (default)
- `/heaven/kobe-bryant` - Kobe-specific page
- `/heaven-kobe-bryant` - Direct route

Video URL priority (in order):
1. **Environment Variable**: `NEXT_PUBLIC_KOBE_DEMO_VIDEO`
2. **Supabase**: `heaven_characters` table (character_id = 'kobe-bryant')
3. **localStorage**: Fallback only

---

## ✅ Option 1: Upload to Mux (Recommended - Best Quality)

### Step 1: Get Your Video Ready
- Video file (MP4, MOV, etc.)
- Or a Google Drive URL

### Step 2: Upload via API

**Option A: Direct Upload to Mux**
```
POST /api/heaven/upload-demo-video
Body: {
  "name": "kobe-bryant",
  "video": [file]
}
```

**Option B: Auto-Process from Google Drive**
```
POST /api/heaven/auto-setup-video
Body: {
  "name": "kobe-bryant",
  "googleDriveUrl": "https://drive.google.com/..."
}
```

**Option C: Set Mux Playback ID (if already uploaded)**
```
POST /api/heaven/set-video-url
Body: {
  "name": "kobe-bryant",
  "videoUrl": "https://stream.mux.com/YOUR_PLAYBACK_ID.m3u8"
}
```

### Step 3: Video Gets Saved
- Automatically saved to Supabase `heaven_characters` table
- Or manually set environment variable in Vercel

---

## ✅ Option 2: Set Environment Variable in Vercel

### Step 1: Get Video URL
- Mux: `https://stream.mux.com/PLAYBACK_ID.m3u8`
- Cloudinary: `https://res.cloudinary.com/.../video.mp4`
- Google Drive: `https://drive.google.com/uc?export=download&id=FILE_ID`
- Any public video URL

### Step 2: Add to Vercel
1. Go to Vercel Dashboard
2. Your Project → Settings → Environment Variables
3. Add:
   - **Key**: `NEXT_PUBLIC_KOBE_DEMO_VIDEO`
   - **Value**: `YOUR_VIDEO_URL_HERE`
4. Save
5. Redeploy

---

## ✅ Option 3: Save to Supabase Directly

### Step 1: Go to Supabase SQL Editor

### Step 2: Run this SQL:

```sql
-- Insert or update Kobe video in heaven_characters table
INSERT INTO heaven_characters (
  user_id,
  character_id,
  character_name,
  slideshow_video_url,
  created_at
)
VALUES (
  'demo',
  'kobe-bryant',
  'Kobe Bryant',
  'YOUR_VIDEO_URL_HERE',
  NOW()
)
ON CONFLICT (user_id, character_id) 
DO UPDATE SET 
  slideshow_video_url = EXCLUDED.slideshow_video_url,
  updated_at = NOW();
```

Replace `YOUR_VIDEO_URL_HERE` with your actual video URL.

---

## ✅ Option 4: Use the Web Interface

### If you have upload UI on the heaven page:
1. Go to `/heaven/kobe-bryant`
2. Look for "Upload Video" button
3. Upload video file
4. URL gets saved automatically

---

## 🎯 Recommended Approach

**Best Practice:**
1. Upload video to **Mux** (best streaming quality)
2. Save **Mux playback ID** to Supabase
3. Optional: Set environment variable as backup

**Quick Setup:**
```bash
# Use the auto-setup endpoint if you have Google Drive URL
curl -X POST https://yourdomain.com/api/heaven/auto-setup-video \
  -H "Content-Type: application/json" \
  -d '{
    "name": "kobe-bryant",
    "googleDriveUrl": "YOUR_GOOGLE_DRIVE_URL"
  }'
```

This will:
- ✅ Upload to Mux
- ✅ Get playback ID
- ✅ Save to Supabase
- ✅ Return the final URL

---

## 🔍 Check Current Status

To see what video URL is currently set:

```sql
-- Check Supabase
SELECT character_id, slideshow_video_url, updated_at
FROM heaven_characters
WHERE character_id = 'kobe-bryant';
```

Or check environment variables in Vercel dashboard.

---

## 🚨 Common Issues

### Video not showing?
1. Check environment variable is set in Vercel
2. Check Supabase has the URL saved
3. Verify URL is accessible (not private)
4. Check browser console for errors

### Video URL expired?
- Google Drive links expire after ~24 hours
- Solution: Upload to Mux for permanent URLs

### Want to change video?
- Update environment variable OR
- Update Supabase record OR
- Upload new video via API

---

## 📋 Quick Checklist

- [ ] Video file ready or URL available
- [ ] Decided on hosting (Mux recommended)
- [ ] Uploaded to chosen service
- [ ] Got permanent URL
- [ ] Saved to Supabase OR set env var
- [ ] Tested at `/heaven/kobe-bryant`

---

**Which method do you want to use?** I can help you set it up!

