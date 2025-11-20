# Set Video URL - Quick Setup

## Give Me Your URL and I'll Handle It!

Just provide:
1. The demo name (e.g., "kobe-bryant" or "kelly-wong")
2. The video URL

I'll:
- ✅ Convert Google Drive/Dropbox links automatically
- ✅ Upload to Mux for permanent hosting (if you want)
- ✅ Save to database
- ✅ Give you the exact Vercel environment variable to add

---

## Method 1: Use the API Endpoint

**Send a POST request to:**
```
https://dashmemories.com/api/heaven/set-video-url
```

**Body (JSON):**
```json
{
  "name": "kobe-bryant",
  "videoUrl": "https://your-video-url-here",
  "uploadToMux": true
}
```

**Response:**
```json
{
  "success": true,
  "videoUrl": "https://stream.mux.com/abc123.m3u8",
  "envVarName": "NEXT_PUBLIC_KOBE_BRYANT_DEMO_VIDEO",
  "instructions": {
    "step1": "Add to Vercel: NEXT_PUBLIC_KOBE_BRYANT_DEMO_VIDEO",
    "step2": "Value: https://stream.mux.com/abc123.m3u8",
    "step3": "Redeploy"
  }
}
```

---

## Method 2: Just Tell Me the URL

**You can just say:**
- "Set kobe-bryant video to: https://drive.google.com/..."
- "Set kelly-wong video to: https://dropbox.com/..."

**I'll:**
1. Process the URL
2. Upload to Mux if needed
3. Give you the exact Vercel environment variable to add

---

## Supported URL Types

✅ **Google Drive** - I'll convert share links to direct links
✅ **Dropbox** - I'll convert to direct download
✅ **Direct video URLs** - Works as-is
✅ **Mux URLs** - Already permanent
✅ **Cloudinary URLs** - Already permanent

---

## Example

**You provide:**
```
Name: kobe-bryant
URL: https://drive.google.com/file/d/1ABC123xyz/view?usp=sharing
```

**I'll:**
1. Convert to: `https://drive.google.com/uc?export=download&id=1ABC123xyz`
2. Upload to Mux: `https://stream.mux.com/abc123.m3u8`
3. Tell you: Add `NEXT_PUBLIC_KOBE_BRYANT_DEMO_VIDEO = https://stream.mux.com/abc123.m3u8` to Vercel

---

## Ready?

**Just give me:**
- Demo name (kobe-bryant or kelly-wong)
- Video URL

**I'll handle the rest!**

