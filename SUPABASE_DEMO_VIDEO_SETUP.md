# 🎬 Supabase Demo Video Setup Guide

## Quick Start: Upload Demo Videos to Supabase

### Step 1: Set Up Supabase Storage

1. **Go to Supabase Dashboard**
   - Visit [supabase.com](https://supabase.com)
   - Select your DASH project
   - Navigate to **Storage** → **Buckets**

2. **Create or Verify `heaven-assets` Bucket**
   - If it doesn't exist, click **"New bucket"**
   - Name: `heaven-assets`
   - **Public bucket**: ✅ Check this (for demo videos)
   - Click **"Create bucket"**

3. **Verify CORS Settings** (if needed)
   - Go to **Storage** → **Policies**
   - Ensure public read access is allowed

### Step 2: Upload Your Videos

**Option A: Via Supabase Dashboard (Easiest)**

1. Go to **Storage** → **heaven-assets** bucket
2. Click **"Upload file"**
3. Upload your video files:
   - `kobe-bryant-demo.mp4`
   - `kelly-wong-demo.mp4`
4. Copy the **Public URL** for each file

**Option B: Via API Endpoint (Programmatic)**

Use the secure API endpoint I created:

```bash
# Upload Kobe Bryant video
curl -X POST https://dashmemories.com/api/heaven/upload-demo-video \
  -F "video=@kobe-video.mp4" \
  -F "name=kobe-bryant"
```

The API will:
- ✅ Validate file type (video only)
- ✅ Validate file size (max 100MB)
- ✅ Upload to Supabase Storage
- ✅ Return public URL

### Step 3: Get Public URLs

After uploading, you'll get URLs like:
```
https://your-project.supabase.co/storage/v1/object/public/heaven-assets/demo-videos/kobe-bryant-1234567890.mp4
```

### Step 4: Add to Vercel Environment Variables

1. **Go to Vercel Dashboard**
   - **Settings** → **Environment Variables**

2. **Add the URLs:**
   ```
   NEXT_PUBLIC_KOBE_DEMO_VIDEO=https://your-project.supabase.co/storage/v1/object/public/heaven-assets/demo-videos/kobe-bryant-1234567890.mp4
   
   NEXT_PUBLIC_KELLY_DEMO_VIDEO=https://your-project.supabase.co/storage/v1/object/public/heaven-assets/demo-videos/kelly-wong-1234567890.mp4
   ```

3. **Select Environment:** Production, Preview, Development
4. **Click Save**
5. **Redeploy** your project

### Step 5: Test

Visit:
- ✅ `https://dashmemories.com/heaven/kobe-bryant`
- ✅ `https://dashmemories.com/heaven/kelly-wong`

---

## 🔒 Security Features

### Public Bucket (Current Setup)
- ✅ Fast access (no authentication needed)
- ✅ CDN delivery via Supabase
- ✅ Good for demo videos
- ⚠️ Anyone with URL can access

### Private Bucket with Signed URLs (More Secure)

If you want more security:

1. **Make bucket private:**
   - Uncheck "Public bucket" in Supabase

2. **Use signed URLs:**
   ```typescript
   // In your API endpoint
   const { data } = await supabase.storage
     .from('heaven-assets')
     .createSignedUrl(fileName, 3600); // 1 hour expiration
   ```

3. **Implement access control:**
   - Add Row Level Security (RLS) policies
   - Require authentication for uploads

---

## 📋 File Organization

Videos are stored in this structure:
```
heaven-assets/
  └── demo-videos/
      ├── kobe-bryant-1234567890.mp4
      ├── kelly-wong-1234567890.mp4
      └── ...
```

---

## 🚀 API Endpoint Details

**Endpoint:** `POST /api/heaven/upload-demo-video`

**Request:**
- `video`: File (required, max 100MB)
- `name`: string (required, e.g., "kobe-bryant")
- `x-admin-secret`: Header (optional, if `HEAVEN_DEMO_UPLOAD_SECRET` is set)

**Response:**
```json
{
  "success": true,
  "videoUrl": "https://...",
  "fileName": "demo-videos/kobe-bryant-1234567890.mp4",
  "message": "Video uploaded successfully"
}
```

**Error Responses:**
- `400`: Missing file or name
- `401`: Unauthorized (if secret is required)
- `500`: Upload failed

---

## 🔧 Troubleshooting

### "Bucket not found"
- ✅ Create `heaven-assets` bucket in Supabase
- ✅ Make sure it's public (for demo videos)

### "Upload failed"
- ✅ Check file size (max 100MB)
- ✅ Verify file is a video (video/* MIME type)
- ✅ Check Supabase Storage quota

### "Video not loading"
- ✅ Verify URL is correct
- ✅ Check bucket is public
- ✅ Test URL directly in browser
- ✅ Check CORS settings if hosted elsewhere

### "Unauthorized"
- ✅ If you set `HEAVEN_DEMO_UPLOAD_SECRET`, include it in headers:
  ```javascript
  headers: {
    'x-admin-secret': 'your-secret-token'
  }
  ```

---

## 📝 Next Steps

1. ✅ Create `heaven-assets` bucket in Supabase
2. ✅ Upload your demo videos
3. ✅ Copy public URLs
4. ✅ Add to Vercel environment variables
5. ✅ Redeploy
6. ✅ Test demo pages

**That's it!** Your videos are now securely hosted on Supabase Storage. 🎉

