# How to Add Kobe & Kelly Demo Videos

## Quick Method: Direct Upload (No Setup Required)

1. **Visit the demo pages:**
   - `https://dashmemories.com/heaven/kobe-bryant`
   - `https://dashmemories.com/heaven/kelly-wong`

2. **Upload your video:**
   - Click **"📹 Upload Video File"** button
   - Select your 9:16 video file
   - Video will be saved and play automatically

   **OR**

   - Paste your video URL in the input field
   - Click **"Use Video URL"**
   - Video will be saved and play automatically

**Note:** This method saves to browser localStorage. Videos will persist for that browser but won't be available to other users.

---

## Permanent Method: Environment Variables (Recommended)

### Step 1: Host Your Videos

Upload your videos to one of these services:

**Option A: Google Drive**
1. Upload video to Google Drive
2. Right-click → "Get link" → Set to "Anyone with the link"
3. Convert share link to direct link:
   - Share link: `https://drive.google.com/file/d/FILE_ID/view?usp=sharing`
   - Direct link: `https://drive.google.com/uc?export=download&id=FILE_ID`

**Option B: Dropbox**
1. Upload video to Dropbox
2. Right-click → "Copy link"
3. Change `?dl=0` to `?dl=1` in the URL for direct download

**Option C: Cloudinary (Recommended for Performance)**
1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Upload video
3. Copy the video URL (ends in `.mp4`)

**Option D: Vercel Blob Storage**
1. Go to Vercel Dashboard → Storage → Blob
2. Upload video
3. Copy the public URL

### Step 2: Add Environment Variables in Vercel

1. **Go to Vercel Dashboard:**
   - Visit [vercel.com](https://vercel.com)
   - Select your **DASH** project
   - Go to **Settings** → **Environment Variables**

2. **Add Kobe Bryant Video:**
   ```
   Key: NEXT_PUBLIC_KOBE_DEMO_VIDEO
   Value: [Paste your Kobe video URL here]
   Environment: ☑ Production ☑ Preview ☑ Development
   ```

3. **Add Kelly Wong Video:**
   ```
   Key: NEXT_PUBLIC_KELLY_DEMO_VIDEO
   Value: [Paste your Kelly video URL here]
   Environment: ☑ Production ☑ Preview ☑ Development
   ```

4. **Optional - Add Photos:**
   ```
   Key: NEXT_PUBLIC_KOBE_DEMO_PHOTO
   Value: [Kobe photo URL]
   
   Key: NEXT_PUBLIC_KELLY_DEMO_PHOTO
   Value: [Kelly photo URL]
   ```

5. **Click "Save"** for each variable

### Step 3: Redeploy

1. Go to **Deployments** tab
2. Click **"..."** on the latest deployment
3. Click **"Redeploy"**
4. Wait 1-2 minutes for build to complete

### Step 4: Test

Visit:
- ✅ `https://dashmemories.com/heaven/kobe-bryant`
- ✅ `https://dashmemories.com/heaven/kelly-wong`

Videos should load and play automatically!

---

## Video Requirements

- **Aspect Ratio:** 9:16 (portrait/vertical)
- **Format:** MP4 (H.264 codec recommended)
- **Resolution:** 1080x1920 (Full HD) or 720x1280 (HD)
- **Size:** Keep under 100MB for faster loading
- **Access:** Must be publicly accessible (no authentication required)

---

## Troubleshooting

**Video not loading?**
- Check that the URL is a direct link to the video file (not a sharing page)
- Test the URL directly in your browser (should play/download)
- Verify CORS is enabled if hosting on a different domain
- Check browser console (F12) for errors

**Video plays but looks stretched?**
- Ensure your video is 9:16 aspect ratio
- Use the conversion guide: `VIDEO_9_16_GUIDE.md`

**Environment variable not working?**
- Make sure variable name matches exactly (case-sensitive)
- Verify it's set for "Production" environment
- Redeploy after adding variables
- Check Vercel build logs for errors

---

## Quick Reference

**Environment Variables:**
```
NEXT_PUBLIC_KOBE_DEMO_VIDEO=https://your-host.com/kobe-video.mp4
NEXT_PUBLIC_KELLY_DEMO_VIDEO=https://your-host.com/kelly-video.mp4
```

**Demo URLs:**
- Kobe: `https://dashmemories.com/heaven/kobe-bryant`
- Kelly: `https://dashmemories.com/heaven/kelly-wong`


