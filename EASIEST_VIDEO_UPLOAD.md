# 🎬 EASIEST Video Upload - Use Mux! (3 Steps)

## The Simplest Way: Just Give Us a URL!

You already have an API that automatically uploads to **Mux** (best video hosting) and saves everything for you!

---

## 🚀 Step 1: Get Your Video URL

**Where's your video?**
- ✅ Google Drive? → Get the share link
- ✅ Already online somewhere? → Copy that URL
- ✅ On your laptop? → Upload to Google Drive first (easiest)

---

## 🚀 Step 2: Call the API

**API:** `POST /api/heaven/auto-setup-video`

### Option A: Use cURL (Easiest!)

**For Kobe Bryant:**
```bash
curl -X POST https://dashmemories.com/api/heaven/auto-setup-video \
  -H "Content-Type: application/json" \
  -d '{
    "name": "kobe-bryant",
    "googleDriveUrl": "YOUR_GOOGLE_DRIVE_URL_HERE",
    "uploadToMux": true
  }'
```

**For Kelly Wong:**
```bash
curl -X POST https://dashmemories.com/api/heaven/auto-setup-video \
  -H "Content-Type: application/json" \
  -d '{
    "name": "kelly-wong",
    "googleDriveUrl": "YOUR_GOOGLE_DRIVE_URL_HERE",
    "uploadToMux": true
  }'
```

### Option B: Use Postman / Insomnia

1. **Method:** POST
2. **URL:** `https://dashmemories.com/api/heaven/auto-setup-video`
3. **Body (JSON):**
```json
{
  "name": "kobe-bryant",
  "googleDriveUrl": "https://drive.google.com/file/d/YOUR_FILE_ID/view",
  "uploadToMux": true
}
```

---

## 🚀 Step 3: Done! ✅

The API automatically:
1. ✅ Extracts video from Google Drive
2. ✅ Uploads to **Mux** (permanent hosting)
3. ✅ Gets Mux playback URL
4. ✅ Saves to Supabase database
5. ✅ Returns the URL

**Response:**
```json
{
  "success": true,
  "videoUrl": "https://stream.mux.com/ABC123xyz.m3u8",
  "playbackId": "ABC123xyz",
  "service": "mux",
  "message": "Video URL processed successfully"
}
```

---

## 📋 Example: Complete Workflow

### 1. Upload Video to Google Drive

1. Go to Google Drive
2. Upload your video file
3. Right-click → **Get link** → **Anyone with the link**
4. Copy the URL

**Example Google Drive URL:**
```
https://drive.google.com/file/d/1mwXwubTJtD8yopRTzTm7MMoShV25JO62/view
```

### 2. Call the API

```bash
curl -X POST https://dashmemories.com/api/heaven/auto-setup-video \
  -H "Content-Type: application/json" \
  -d '{
    "name": "kobe-bryant",
    "googleDriveUrl": "https://drive.google.com/file/d/1mwXwubTJtD8yopRTzTm7MMoShV25JO62/view",
    "uploadToMux": true
  }'
```

### 3. Video is Live! 🎉

- ✅ Video uploaded to Mux
- ✅ Saved to Supabase database
- ✅ Available at `https://dashmemories.com/heaven/kobe-bryant`

---

## 🎯 What the API Does

1. **Extracts Google Drive file ID** from URL
2. **Converts to direct download URL**
3. **Uploads to Mux** (if `uploadToMux: true`)
4. **Gets Mux playback URL** (like `https://stream.mux.com/ABC123.m3u8`)
5. **Saves to Supabase** `heaven_characters` table
6. **Returns everything** ready to use

---

## ✅ Requirements

**You just need:**
- ✅ Mux API keys configured in Vercel (already set up?)
- ✅ Supabase configured (already done!)

**Check if Mux is configured:**
- Go to Vercel → Environment Variables
- Look for: `MUX_TOKEN_ID` and `MUX_TOKEN_SECRET`

---

## 🔄 Alternative: Direct Video URL

**If your video is already hosted somewhere else:**

```bash
curl -X POST https://dashmemories.com/api/heaven/set-video-url \
  -H "Content-Type: application/json" \
  -d '{
    "name": "kobe-bryant",
    "videoUrl": "https://your-video-url.com/video.mp4",
    "uploadToMux": true
  }'
```

This will:
1. Optionally upload to Mux
2. Save to Supabase
3. Ready to use!

---

## 🎉 That's It!

**3 Steps:**
1. Get video URL (Google Drive, etc.)
2. Call API
3. Done!

**No manual Supabase setup, no storage buckets to configure** - the API handles everything!

---

## 💡 Pro Tip

**If you want to use Cloudinary instead of Mux:**

```bash
curl -X POST https://dashmemories.com/api/heaven/auto-setup-video \
  -H "Content-Type: application/json" \
  -d '{
    "name": "kobe-bryant",
    "googleDriveUrl": "YOUR_GOOGLE_DRIVE_URL",
    "uploadToMux": false
  }'
```

Then configure Cloudinary in your environment variables.

---

## 🚀 Ready to Go?

Just paste your Google Drive URL and run the curl command! The API does everything else automatically! 🎬

