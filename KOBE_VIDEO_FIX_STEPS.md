# 🎬 Get Kobe Video Working on https://dashmemories.com/heaven/kobe-bryant

## ✅ Simple Solution

You have a video file. Here's how to get it working on that URL:

---

## 📋 Step 1: Upload Your Video File

**Go to:**
```
https://dashmemories.com/upload-kobe-video
```

**Then:**
1. Click "Select Video File"
2. Choose your video file
3. Click "Upload to Mux"
4. Wait for upload (progress bar shows)

---

## 📋 Step 2: Video Gets Saved Automatically

The upload page will:
- ✅ Upload to Mux
- ✅ Get playback ID
- ✅ **Save to Supabase automatically** (so it appears on the page immediately!)
- ✅ Give you the URL to set in Vercel (optional - for backup)

---

## 📋 Step 3: Test the Page

**Visit:**
```
https://dashmemories.com/heaven/kobe-bryant
```

**The video should play!** ✅

It loads from Supabase, so it works immediately after upload (no Vercel env var needed).

---

## 🔧 Optional: Also Set in Vercel (Backup)

After upload, copy the video URL shown and:

1. **Vercel Dashboard** → Settings → Environment Variables
2. Add: `NEXT_PUBLIC_KOBE_DEMO_VIDEO`
3. Value: The Mux URL (starts with `https://stream.mux.com/`)
4. Save and redeploy

This is optional - Supabase takes priority, but this is a backup.

---

## 🎯 What Happens

**After upload:**
- Video saved to Supabase `heaven_characters` table
- `character_id = 'kobe-bryant'`
- `user_id = 'demo'`
- `slideshow_video_url = 'https://stream.mux.com/...'`

**When someone visits `/heaven/kobe-bryant`:**
1. Checks env var (if set)
2. **Checks Supabase** ← Your video is here!
3. Loads video and plays

---

## ✅ That's It!

**Just upload the file and it works!**

Go to: `/upload-kobe-video` and upload your video file now.

