# HEAVEN Kobe Bryant Page Setup

## Route
**URL:** `https://dashmemories.com/heaven/kobe-bryant`

## Current Configuration

### Video URL
- **Default:** `https://drive.google.com/uc?export=download&id=1mwXwubTJtD8yopRTzTm7MMoShV25JO62`
- **Environment Variable:** `NEXT_PUBLIC_KOBE_DEMO_VIDEO` (optional override)

### Video Loading Priority
1. Environment variable (`NEXT_PUBLIC_KOBE_DEMO_VIDEO`)
2. Supabase database (`heaven_characters` table)
3. localStorage (`heaven_video_kobe-bryant`)
4. Default Google Drive URL

## Current Status
✅ Page route is set up at `/heaven/kobe-bryant`
✅ Video URL is configured
✅ Fullscreen 9:16 display
✅ Error handling in place
✅ Loading states configured

## If Video Not Displaying

### Common Issues:

1. **CORS Error (Most Common)**
   - Google Drive videos often blocked by CORS
   - **Solution:** File must be publicly shared as "Anyone with the link can view"

2. **Video Format**
   - Must be publicly accessible
   - File sharing settings in Google Drive must allow public access

3. **URL Format**
   - Current format: `https://drive.google.com/uc?export=download&id=FILE_ID`
   - This is correct for direct download

### Debugging Steps:

1. **Open Browser Console (F12)**
   - Check for error messages
   - Look for CORS errors or 404s

2. **Check Video URL**
   - Visit the URL directly in browser
   - Should download or play the video

3. **Verify File Sharing**
   - In Google Drive, right-click file → Share
   - Must be set to "Anyone with the link can view"

4. **Test Environment Variable**
   - Check if `NEXT_PUBLIC_KOBE_DEMO_VIDEO` is set in Vercel
   - This overrides the default URL

## Alternative Solutions

If Google Drive continues to have CORS issues:

1. **Upload to Different Hosting:**
   - Upload video to Mux, Cloudinary, or Supabase Storage
   - Use that URL instead

2. **Use Video Proxy API:**
   - Already created: `/api/heaven/video-proxy`
   - Can be enabled if needed

3. **Set Environment Variable:**
   - Upload video to a CORS-friendly host
   - Set `NEXT_PUBLIC_KOBE_DEMO_VIDEO` in Vercel

## Page Features
- Fullscreen video player
- 9:16 aspect ratio optimized
- Auto-play and loop
- Loading states
- Error messages
- Back button navigation

