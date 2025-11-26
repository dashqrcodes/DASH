# 🎬 Upload Kobe Video File - Simple Steps

## 🎯 Goal
Get your video file working on:
- `https://dashmemories.com/heaven/kobe-bryant`
- `https://www.dashqrcodes.com/heaven-kobe-bryant` (if you have that route)

---

## ✅ Step-by-Step

### Step 1: Go to Upload Page

Visit:
```
http://localhost:3000/upload-kobe-video
```

Or on production:
```
https://dashmemories.com/upload-kobe-video
```

### Step 2: Upload Your Video File

1. Click "Select Video File"
2. Choose your video file
3. Click "Upload to Mux"
4. Wait for upload to complete (progress bar shows)

### Step 3: Copy the Video URL

After upload, you'll see:
```
✅ Upload Successful!
Video URL: https://stream.mux.com/ABC123xyz.m3u8
```

Click "📋 Copy URL to Clipboard"

### Step 4: Set in Vercel

1. Go to **Vercel Dashboard**
2. Your Project → **Settings** → **Environment Variables**
3. Add/Edit:
   - **Key**: `NEXT_PUBLIC_KOBE_DEMO_VIDEO`
   - **Value**: Paste the copied URL (starts with `https://stream.mux.com/`)
4. **Save**
5. **Redeploy** your project

### Step 5: Test It!

Visit:
- `https://dashmemories.com/heaven/kobe-bryant`
- Video should play! ✅

---

## 🚀 What Happens Automatically

The upload page will:
1. ✅ Upload video to Mux (best quality)
2. ✅ Wait for Mux to process
3. ✅ Save to Supabase `heaven_characters` table
4. ✅ Give you the URL to paste in Vercel

---

## 🔍 If It Still Doesn't Work

**Check:**
1. Did you redeploy Vercel after setting the env var?
2. Is the env var set for the right environment (Production)?
3. Check browser console (F12) for errors

**The URL should look like:**
```
https://stream.mux.com/YOUR_PLAYBACK_ID.m3u8
```

**NOT:**
```
https://www.dashqrcodes.com/heaven-kobe-bryant
```

That webpage URL won't work - we need the direct video file URL from Mux!

---

**Ready? Go to `/upload-kobe-video` and upload your file!** 🎬

