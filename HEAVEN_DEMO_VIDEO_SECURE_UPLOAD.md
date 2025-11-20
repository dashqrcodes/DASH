# 🎬 Secure HEAVEN Demo Video Upload Guide

## Overview
This guide shows you how to securely upload and host demo videos for HEAVEN memorial pages.

## 🔒 Security Best Practices

### Current Options (Ranked by Security):

1. **✅ Environment Variables (Recommended for Demos)**
   - Videos hosted on secure CDN (Mux, Cloudinary, Vercel Blob)
   - URLs stored in environment variables
   - No public API endpoints needed
   - Fast and secure

2. **✅ Supabase Storage with Signed URLs**
   - Videos uploaded to Supabase Storage
   - Signed URLs with expiration
   - Access control via Row Level Security (RLS)
   - Best for production

3. **✅ Mux Video Hosting**
   - Professional video streaming
   - Automatic transcoding
   - Signed playback tokens
   - Best for high-quality demos

4. **⚠️ Direct File Upload (Current - Not Secure)**
   - Converts to data URL (stored in localStorage)
   - Not suitable for production
   - Large files cause performance issues

## 📤 Method 1: Environment Variables (Easiest & Secure)

### Step 1: Upload Your Videos

**Option A: Use Vercel Blob Storage**
1. Go to [Vercel Dashboard](https://vercel.com)
2. Select your project
3. Go to **Storage** → **Blob**
4. Upload your video files
5. Copy the public URL

**Option B: Use Cloudinary**
1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Upload video to Media Library
3. Get the **Secure URL** (HTTPS)
4. Copy the URL

**Option C: Use Mux**
1. Sign up at [mux.com](https://mux.com)
2. Upload video via dashboard
3. Get the playback URL
4. Copy the URL

### Step 2: Add to Vercel Environment Variables

1. Go to **Vercel Dashboard** → **Settings** → **Environment Variables**
2. Add these variables:

```
NEXT_PUBLIC_KOBE_DEMO_VIDEO=https://your-secure-cdn.com/kobe-video.mp4
NEXT_PUBLIC_KELLY_DEMO_VIDEO=https://your-secure-cdn.com/kelly-video.mp4
```

3. Select **Production, Preview, Development**
4. Click **Save**
5. **Redeploy** your project

### Step 3: Test

Visit:
- `https://dashmemories.com/heaven/kobe-bryant`
- `https://dashmemories.com/heaven/kelly-wong`

---

## 📤 Method 2: Upload to Supabase Storage (Recommended for Production)

### Step 1: Set Up Supabase Storage Bucket

1. **Go to Supabase Dashboard**
   - Visit [supabase.com](https://supabase.com)
   - Select your project
   - Go to **Storage** → **Buckets**

2. **Create or Verify Bucket**
   - Bucket name: `heaven-assets`
   - Make it **Public** (for demo videos)
   - Or use **Private** with signed URLs (more secure)

3. **Set Up CORS (if needed)**
   - Go to **Storage** → **Policies**
   - Allow public read access for demo videos

### Step 2: Upload via API Endpoint

I've created a secure API endpoint at `/api/heaven/upload-demo-video`

**Option A: Using cURL**
```bash
curl -X POST https://dashmemories.com/api/heaven/upload-demo-video \
  -H "x-admin-secret: YOUR_SECRET_TOKEN" \
  -F "video=@kobe-video.mp4" \
  -F "name=kobe-bryant"
```

**Option B: Using JavaScript/Frontend**
```javascript
const formData = new FormData();
formData.append('video', videoFile);
formData.append('name', 'kobe-bryant');

const response = await fetch('/api/heaven/upload-demo-video', {
  method: 'POST',
  headers: {
    'x-admin-secret': 'YOUR_SECRET_TOKEN' // Optional, if set in env
  },
  body: formData
});

const result = await response.json();
console.log('Video URL:', result.videoUrl);
```

### Step 3: API Returns Secure URL

```json
{
  "success": true,
  "videoUrl": "https://your-project.supabase.co/storage/v1/object/public/heaven-assets/demo-videos/kobe-bryant-1234567890.mp4",
  "fileName": "demo-videos/kobe-bryant-1234567890.mp4",
  "message": "Video uploaded successfully"
}
```

### Step 4: Add URL to Environment Variable

Copy the `videoUrl` from the response and add it to Vercel:

```
NEXT_PUBLIC_KOBE_DEMO_VIDEO=https://your-project.supabase.co/storage/v1/object/public/heaven-assets/demo-videos/kobe-bryant-1234567890.mp4
```

### Step 5: Optional - Add Admin Secret (Recommended)

For extra security, add an admin secret:

1. **In Vercel Environment Variables:**
   ```
   HEAVEN_DEMO_UPLOAD_SECRET=your-super-secret-token-here
   ```

2. **Include in API requests:**
   ```javascript
   headers: {
     'x-admin-secret': 'your-super-secret-token-here'
   }
   ```

---

## 🔐 Security Features

### 1. **Signed URLs with Expiration**
- URLs expire after set time (e.g., 1 year)
- Prevents unauthorized access
- Can be refreshed via API

### 2. **Access Control**
- Row Level Security (RLS) in Supabase
- Only authorized users can upload
- Public read access for demo pages

### 3. **File Validation**
- File type checking (video/* only)
- File size limits (e.g., 100MB max)
- Virus scanning (optional)

### 4. **HTTPS Only**
- All video URLs must be HTTPS
- Prevents man-in-the-middle attacks
- Required for secure sites

---

## 🚀 Quick Start (Recommended)

**For now, use Method 1 (Environment Variables):**

1. **Upload your videos to one of these:**
   - Vercel Blob Storage (easiest)
   - Cloudinary (free tier available)
   - Mux (best quality)

2. **Get the public HTTPS URL**

3. **Add to Vercel Environment Variables:**
   ```
   NEXT_PUBLIC_KOBE_DEMO_VIDEO=https://your-video-url.mp4
   NEXT_PUBLIC_KELLY_DEMO_VIDEO=https://your-video-url.mp4
   ```

4. **Redeploy**

5. **Done!** Videos are now secure and fast.

---

## 📋 Video Requirements

### Format
- **Recommended:** MP4 (H.264 codec)
- **Also supported:** WebM, MOV
- **Resolution:** 9:16 (portrait) for mobile
- **Max file size:** 100MB (for direct upload)

### Optimization
- Compress before uploading
- Use 720p or 1080p (not 4K)
- Keep duration reasonable (1-5 minutes for demos)

---

## 🔧 Troubleshooting

### Video Not Loading
- ✅ Check URL is HTTPS
- ✅ Verify URL is publicly accessible
- ✅ Test URL directly in browser
- ✅ Check CORS headers if hosted elsewhere

### Security Warnings
- ✅ Use HTTPS URLs only
- ✅ Don't store videos in public folder
- ✅ Use signed URLs for sensitive content
- ✅ Implement access controls

### Performance Issues
- ✅ Use CDN (Cloudinary, Mux, Vercel Blob)
- ✅ Enable video compression
- ✅ Use adaptive bitrate streaming (Mux)

---

## 🎯 Next Steps

1. **Choose your hosting method** (Vercel Blob recommended)
2. **Upload your videos**
3. **Add URLs to environment variables**
4. **Redeploy**
5. **Test the demo pages**

**Need help?** Let me know which method you prefer and I'll help you set it up!

