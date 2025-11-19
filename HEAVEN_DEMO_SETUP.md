# 🎬 HEAVEN Demo Video Setup Guide

## Overview
This guide shows you how to set up demo videos for specific memorial pages:
- `https://dashmemories.com/heaven/kobe-bryant`
- `https://dashmemories.com/heaven/kelly-wong`

## Step 1: Get Your Video Links

You mentioned you already have the video links. Make sure they are:
- ✅ **Publicly accessible URLs** (not behind authentication)
- ✅ **Direct video file URLs** (`.mp4`, `.webm`, etc.) or **streaming URLs** (HLS, DASH)
- ✅ **HTTPS** (required for secure sites)
- ✅ **CORS-enabled** (if hosted on a different domain)

### Recommended Video Hosting Options:

1. **Vercel Blob Storage** (Recommended)
   - Upload via Vercel dashboard
   - Get direct URL
   - Fast CDN delivery

2. **Cloudinary**
   - Upload video
   - Get optimized streaming URL
   - Automatic format conversion

3. **Mux**
   - Best for video streaming
   - Automatic transcoding
   - Adaptive bitrate

4. **AWS S3 + CloudFront**
   - Direct file hosting
   - CDN delivery

5. **YouTube/Vimeo** (Embedded)
   - Use embed URLs
   - Requires iframe implementation

## Step 2: Add Environment Variables in Vercel

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Select your project (DASH)
   - Go to **Settings** → **Environment Variables**

2. **Add the following variables:**

   **For Kobe Bryant:**
   ```
   Key: NEXT_PUBLIC_KOBE_DEMO_VIDEO
   Value: [Your Kobe Bryant video URL]
   Environment: Production, Preview, Development
   ```

   **For Kelly Wong:**
   ```
   Key: NEXT_PUBLIC_KELLY_DEMO_VIDEO
   Value: [Your Kelly Wong video URL]
   Environment: Production, Preview, Development
   ```

   **Optional - Photo URLs:**
   ```
   Key: NEXT_PUBLIC_KOBE_DEMO_PHOTO
   Value: [Kobe Bryant photo URL]
   
   Key: NEXT_PUBLIC_KELLY_DEMO_PHOTO
   Value: [Kelly Wong photo URL]
   ```

3. **Save Changes**
   - Click **"Save"** after adding each variable

## Step 3: Redeploy

After adding environment variables:

1. **Go to Deployments**
   - Click on your latest deployment
   - Click **"..."** → **"Redeploy"**
   - Or push a new commit to trigger a new deployment

2. **Wait for Build**
   - Build usually takes 1-2 minutes
   - Environment variables are injected during build

## Step 4: Test the URLs

Once deployed, test:

- ✅ `https://dashmemories.com/heaven/kobe-bryant`
- ✅ `https://dashmemories.com/heaven/kelly-wong`

### What to Check:
- [ ] Video loads and plays automatically
- [ ] Video loops correctly
- [ ] Video controls work (play/pause/volume)
- [ ] Page title shows correct name
- [ ] Demo badge shows at top
- [ ] Mobile responsive (works on phone)

## Step 5: Troubleshooting

### Video Not Loading

**Check 1: Environment Variables**
- Verify variables are set in Vercel
- Check variable names match exactly (case-sensitive)
- Ensure they're set for the correct environment (Production)

**Check 2: Video URL**
- Test the URL directly in browser (should download/play)
- Check if URL requires authentication
- Verify CORS headers if hosted elsewhere

**Check 3: Browser Console**
- Open browser DevTools (F12)
- Check Console tab for errors
- Look for CORS errors, 404s, or network failures

**Check 4: Network Tab**
- Check if video request is being made
- Verify response status (should be 200)
- Check Content-Type header (should be video/*)

### Video Plays But Doesn't Loop

- Check if video element has `loop` attribute (already in code)
- Some browsers require `playsInline` for mobile
- Verify video format is supported (MP4 is most compatible)

### Video Quality Issues

- Use a video hosting service with transcoding (Mux, Cloudinary)
- Ensure video is optimized (compressed, right resolution)
- Consider multiple quality levels (adaptive bitrate)

## Quick Reference

**Environment Variables:**
```
NEXT_PUBLIC_KOBE_DEMO_VIDEO=https://your-video-host.com/kobe-video.mp4
NEXT_PUBLIC_KELLY_DEMO_VIDEO=https://your-video-host.com/kelly-video.mp4
NEXT_PUBLIC_KOBE_DEMO_PHOTO=https://your-photo-host.com/kobe-photo.jpg (optional)
NEXT_PUBLIC_KELLY_DEMO_PHOTO=https://your-photo-host.com/kelly-photo.jpg (optional)
```

**URLs:**
- Kobe: `https://dashmemories.com/heaven/kobe-bryant`
- Kelly: `https://dashmemories.com/heaven/kelly-wong`

**Code Location:**
- `src/pages/heaven/[name].tsx` - Demo page component
- `DEMO_CONFIGS` object - Configuration for each demo

## Adding More Demos

To add more demo pages:

1. **Add to DEMO_CONFIGS** in `src/pages/heaven/[name].tsx`:
   ```typescript
   'new-person': {
     name: 'Person Name',
     videoUrl: process.env.NEXT_PUBLIC_NEW_PERSON_DEMO_VIDEO || 'fallback-url',
     photoUrl: process.env.NEXT_PUBLIC_NEW_PERSON_DEMO_PHOTO || undefined
   }
   ```

2. **Add environment variable** in Vercel:
   ```
   NEXT_PUBLIC_NEW_PERSON_DEMO_VIDEO
   ```

3. **Access at:**
   ```
   https://dashmemories.com/heaven/new-person
   ```

---

**Need Help?**
- Check browser console for errors
- Verify environment variables in Vercel
- Test video URL directly in browser
- Ensure video is publicly accessible

