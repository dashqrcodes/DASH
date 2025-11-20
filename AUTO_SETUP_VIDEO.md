# Auto-Setup Video URL - Server-Side with Vercel

## I'll Handle It Server-Side!

Just provide the Google Drive URL and demo name, and I'll:
- ✅ Convert Google Drive link automatically
- ✅ Upload to Mux for permanent hosting
- ✅ Save to database
- ✅ Give you exact Vercel instructions

---

## Method 1: Use the API (I'll Process It)

**Call this endpoint:**
```
POST https://dashmemories.com/api/heaven/auto-setup-video
```

**Body:**
```json
{
  "name": "kobe-bryant",
  "googleDriveUrl": "https://drive.google.com/file/d/1mwXwubTJtD8yopRTzTm7MMoShV25JO62/view",
  "uploadToMux": true
}
```

**Response:**
```json
{
  "success": true,
  "videoUrl": "https://stream.mux.com/abc123.m3u8",
  "envVarName": "NEXT_PUBLIC_KOBE_BRYANT_DEMO_VIDEO",
  "copyPaste": {
    "key": "NEXT_PUBLIC_KOBE_BRYANT_DEMO_VIDEO",
    "value": "https://stream.mux.com/abc123.m3u8"
  },
  "instructions": {
    "step1": "Go to Vercel Dashboard → Settings → Environment Variables",
    "step2": "Add or edit: NEXT_PUBLIC_KOBE_BRYANT_DEMO_VIDEO",
    "step3": "Set value to: https://stream.mux.com/abc123.m3u8",
    ...
  }
}
```

---

## Method 2: Just Tell Me (I'll Process It)

**You say:**
- "Set kobe-bryant to: https://drive.google.com/file/d/1mwXwubTJtD8yopRTzTm7MMoShV25JO62/view"

**I'll:**
1. Process it server-side
2. Upload to Mux
3. Give you the exact Vercel env var to add

---

## For Your Current URL

**Your Google Drive URL:**
```
https://drive.google.com/file/d/1mwXwubTJtD8yopRTzTm7MMoShV25JO62/view
```

**Just tell me:**
- Which demo? (kobe-bryant or kelly-wong)

**I'll process it and give you:**
- The permanent Mux URL
- Exact Vercel environment variable to add
- Copy-paste ready instructions

---

## Quick Test

After I process it, you can test by:
1. Adding the env var to Vercel
2. Redeploying
3. Visiting: `https://dashmemories.com/heaven/kobe-bryant` (or kelly-wong)

The video will load automatically for everyone!


