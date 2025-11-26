# 🎬 Kobe Video - What to Do

## 🎯 You Have 3 Options:

### Option 1: Upload Video File Directly (Easiest) ⭐

**If you have the video file:**

1. **Upload via API** (uses Mux - best quality):
   ```bash
   POST /api/heaven/upload-demo-video
   Body: FormData with:
   - name: "kobe-bryant"
   - video: [your video file]
   ```

2. **Or use Google Drive URL** (auto-uploads to Mux):
   ```bash
   POST /api/heaven/auto-setup-video
   Body: {
     "name": "kobe-bryant",
     "googleDriveUrl": "https://drive.google.com/file/d/YOUR_FILE_ID/view"
   }
   ```

This will:
- ✅ Upload to Mux automatically
- ✅ Save to Supabase
- ✅ Give you the URL to paste in Vercel

---

### Option 2: Set URL in Vercel Environment Variable

**If you already have a video URL:**

1. Go to **Vercel Dashboard**
2. **Settings → Environment Variables**
3. Add/Edit:
   - **Key**: `NEXT_PUBLIC_KOBE_DEMO_VIDEO`
   - **Value**: `YOUR_VIDEO_URL_HERE`
4. **Save** and **Redeploy**

---

### Option 3: Save to Supabase Database

**If you want it in the database:**

Run this SQL in Supabase:

```sql
INSERT INTO heaven_characters (
  user_id,
  character_id,
  character_name,
  slideshow_video_url
)
VALUES (
  'demo',
  'kobe-bryant',
  'Kobe Bryant',
  'YOUR_VIDEO_URL_HERE'
)
ON CONFLICT (user_id, character_id) 
DO UPDATE SET slideshow_video_url = EXCLUDED.slideshow_video_url;
```

---

## 🤔 Which One Should You Use?

**Recommended:** Option 1 (Upload to Mux)
- Best video quality
- Fast streaming
- Permanent URL
- Automatic setup

**Quick Fix:** Option 2 (Vercel env var)
- If you already have a URL
- Fastest to set up
- Works immediately

**Database:** Option 3 (Supabase)
- If you want it in database
- Can be shared across domains
- Persistent storage

---

## ✅ Current Status Check

To see what's currently set:

**Check Vercel:**
- Go to Environment Variables
- Look for `NEXT_PUBLIC_KOBE_DEMO_VIDEO`

**Check Supabase:**
```sql
SELECT slideshow_video_url 
FROM heaven_characters 
WHERE character_id = 'kobe-bryant';
```

**Test the page:**
- Go to `/heaven/kobe-bryant`
- See if video loads

---

## 🚀 Quick Start (Recommended)

**If you have a Google Drive link:**

1. Copy the Google Drive share URL
2. Call the API:
   ```
   POST https://yourdomain.com/api/heaven/auto-setup-video
   {
     "name": "kobe-bryant",
     "googleDriveUrl": "https://drive.google.com/file/d/..."
   }
   ```
3. Copy the returned `videoUrl`
4. Paste it in Vercel as `NEXT_PUBLIC_KOBE_DEMO_VIDEO`
5. Done! ✅

---

**Do you have:**
- A video file? → Use Option 1 (upload)
- A video URL already? → Use Option 2 (Vercel env var)
- Want me to help set it up? → Tell me which option!

