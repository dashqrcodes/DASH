# 🎬 Upload Video to Supabase Storage (Backend Method)

## ✅ The Right Way: Use the Backend API!

Your app has a **backend API endpoint** that uploads videos directly to **Supabase Storage** and saves the URL to the database automatically!

---

## 🚀 Step 1: Upload Video via API

**API Endpoint:** `POST /api/heaven/upload-demo-video`

### Option A: Using cURL (Command Line)

```bash
curl -X POST https://dashmemories.com/api/heaven/upload-demo-video \
  -F "video=@/path/to/your/video.mp4" \
  -F "name=kobe-bryant"
```

**Replace:**
- `/path/to/your/video.mp4` with your actual video file path
- `kobe-bryant` with the character name (e.g., `kelly-wong`)

### Option B: Using a Frontend Upload Form

1. **Go to:** `https://dashmemories.com/heaven/kobe-bryant`
2. **Look for:** Upload button/form
3. **Select video file**
4. **Upload!**

The backend automatically:
- ✅ Uploads to Supabase Storage (`heaven-assets` bucket)
- ✅ Gets the public URL
- ✅ Saves to `heaven_characters` table in Supabase
- ✅ Returns the URL

---

## 📋 What Happens Behind the Scenes

1. **Video file** → Sent to `/api/heaven/upload-demo-video`
2. **Backend** → Uploads to Supabase Storage bucket: `heaven-assets`
3. **Storage path:** `demo-videos/kobe-bryant-1234567890.mp4`
4. **Public URL:** Generated automatically by Supabase
5. **Database:** URL saved to `heaven_characters` table

---

## 🔧 Backend Setup Requirements

### 1. Supabase Storage Bucket

**Make sure you have the `heaven-assets` bucket in Supabase:**

1. Go to **Supabase Dashboard** → **Storage**
2. Check if `heaven-assets` bucket exists
3. **If not, create it:**
   - Click **"New bucket"**
   - Name: `heaven-assets`
   - **Public:** ✅ Yes (so videos are accessible)
   - Click **"Create bucket"**

### 2. Storage Policies

**Make sure the bucket allows uploads:**

1. Go to **Storage** → **heaven-assets** → **Policies**
2. Should have:
   - ✅ **SELECT** policy (public read)
   - ✅ **INSERT** policy (allow uploads)

**If missing, add policies:**

```sql
-- Allow public read
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'heaven-assets');

-- Allow authenticated uploads
CREATE POLICY "Authenticated Upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'heaven-assets' 
  AND auth.role() = 'authenticated'
);
```

---

## 🎯 Complete Workflow

### Method 1: Upload via Frontend (Easiest!)

1. **Go to:** `/heaven/kobe-bryant` page
2. **Click upload button** (if available)
3. **Select video file**
4. **Done!** ✅ Video is now in Supabase Storage

### Method 2: Upload via API Directly

```bash
# Upload Kobe video
curl -X POST https://dashmemories.com/api/heaven/upload-demo-video \
  -F "video=@kobe-video.mp4" \
  -F "name=kobe-bryant"

# Upload Kelly video
curl -X POST https://dashmemories.com/api/heaven/upload-demo-video \
  -F "video=@kelly-video.mp4" \
  -F "name=kelly-wong"
```

**Response:**
```json
{
  "success": true,
  "videoUrl": "https://your-project.supabase.co/storage/v1/object/public/heaven-assets/demo-videos/kobe-bryant-1234567890.mp4",
  "fileName": "demo-videos/kobe-bryant-1234567890.mp4",
  "message": "Video uploaded successfully"
}
```

---

## ✅ After Upload

**The video URL is automatically saved to Supabase!**

The code checks:
1. Environment variables (optional)
2. **Supabase database** ← Your video is here!
3. localStorage (fallback)

**No need to manually set environment variables!** The Supabase database is the source of truth.

---

## 🔍 Verify Upload

**Check Supabase:**

1. **Storage:** Go to Storage → `heaven-assets` → `demo-videos`
   - Should see your video file

2. **Database:** Go to Table Editor → `heaven_characters`
   - Find row with `user_id = 'demo'` and `character_id = 'kobe-bryant'`
   - Check `slideshow_video_url` column
   - Should have the Supabase Storage URL

---

## 🎯 That's It!

**Summary:**
1. ✅ Upload video via `/api/heaven/upload-demo-video`
2. ✅ Video goes to Supabase Storage
3. ✅ URL automatically saved to database
4. ✅ Page loads video from database

**No Vercel environment variables needed!** Everything is in Supabase! 🎉

