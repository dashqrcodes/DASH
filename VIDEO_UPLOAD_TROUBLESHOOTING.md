# Video Upload Not Working - Troubleshooting

## Quick Fix: Use URL Paste Method Instead

**This is faster and more reliable:**

1. Upload your video to Google Drive or Dropbox first
2. Get the share link
3. Go to the demo page
4. Paste the URL in the "Paste video URL" field
5. Click "Use Video URL"
6. **Done!** (No upload needed)

---

## If File Upload Isn't Working

### Check 1: File Format
- ✅ **Supported:** MP4, MOV, AVI, WebM
- ❌ **Not supported:** Some iPhone formats (HEVC/HEIC)

**Fix:** Convert to MP4 if needed

### Check 2: File Size
- **Maximum:** 500MB
- **Recommended:** Under 100MB for faster upload

**Fix:** Compress video or use URL method

### Check 3: Browser Console
1. Open browser console (F12)
2. Look for error messages
3. Check Network tab for failed requests

### Check 4: Mux/Cloudinary Not Configured
If you see "Upload failed" or "No video hosting service available":

**Option A: Use URL Method (Recommended)**
- Upload to Google Drive/Dropbox
- Paste URL instead

**Option B: Configure Mux/Cloudinary**
- Add credentials to Vercel environment variables
- Redeploy

---

## Error Messages & Solutions

**"File must be a video"**
- Make sure you selected a video file
- Try converting to MP4

**"File too large"**
- Compress the video
- Or use URL method with Google Drive

**"Upload failed"**
- Check internet connection
- Try URL method instead
- Check browser console for details

**"No video hosting service available"**
- Mux/Cloudinary not configured
- Use URL method instead (works without setup)

---

## Recommended: Use URL Method

**Why it's better:**
- ✅ Works immediately
- ✅ No file size limits
- ✅ No upload wait time
- ✅ Works without Mux/Cloudinary setup

**How:**
1. Upload video to Google Drive
2. Get share link
3. Convert to direct link:
   - Share: `https://drive.google.com/file/d/FILE_ID/view`
   - Direct: `https://drive.google.com/uc?export=download&id=FILE_ID`
4. Paste in demo page
5. Done!

---

## Still Not Working?

**Try this:**
1. Check browser console (F12) - what error do you see?
2. Try a different browser
3. Try the URL paste method
4. Check file size and format

**Tell me:**
- What error message do you see?
- What file format is your video?
- How large is the file?


