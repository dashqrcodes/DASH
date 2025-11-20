# How to Change the HEAVEN Demo Video

## Method 1: Update Vercel Environment Variable (Permanent - Recommended)

### For Kobe Bryant:
1. **Vercel** → **Settings** → **Environment Variables**
2. Find `NEXT_PUBLIC_KOBE_DEMO_VIDEO`
3. Click to **edit**
4. Change the **Value** to your new video URL
5. **Save**
6. **Redeploy**

### For Kelly Wong:
1. Same steps, but edit `NEXT_PUBLIC_KELLY_DEMO_VIDEO`

---

## Method 2: Upload via the Demo Page (Quick Test)

1. Go to `https://dashmemories.com/heaven/kobe-bryant` (or kelly-wong)
2. Click **"📹 Upload Video File"**
3. Select your new video
4. It will upload and play immediately
5. **Note:** This saves to localStorage (this browser only) or Supabase if configured

---

## Method 3: Paste URL on Demo Page (Fastest)

1. Go to `https://dashmemories.com/heaven/kobe-bryant`
2. Paste your video URL in the **"Paste video URL"** field
3. Click **"Use Video URL"**
4. Works immediately!

---

## Method 4: Use the API (Server-Side)

**POST to:**
```
https://dashmemories.com/api/heaven/auto-setup-video
```

**Body:**
```json
{
  "name": "kobe-bryant",
  "googleDriveUrl": "https://drive.google.com/file/d/YOUR_NEW_VIDEO_ID/view",
  "uploadToMux": true
}
```

This will:
- Convert Google Drive link
- Upload to Mux
- Save to database
- Give you the new URL to add to Vercel

---

## Video Priority Order

The system checks in this order:
1. **Environment Variable** (Vercel) - Permanent, all devices ⭐
2. **Supabase Database** - Permanent, all devices
3. **localStorage** - Temporary, this browser only
4. **Default placeholder** - Fallback

**To make it permanent for everyone:** Use Method 1 (Vercel env var)

---

## Quick Steps to Change Video

**Easiest Way:**
1. Get your new video URL (Google Drive, Dropbox, etc.)
2. Convert to direct link if needed
3. Update Vercel environment variable
4. Redeploy
5. Done!

**For Testing:**
1. Go to demo page
2. Paste URL or upload file
3. Works immediately (but only for you until you add to Vercel)

---

## Need Help?

**Tell me:**
- Which demo? (kobe-bryant or kelly-wong)
- What's your new video URL?
- I'll give you the exact Vercel variable to update!


