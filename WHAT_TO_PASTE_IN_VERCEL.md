# What to Paste in Vercel Environment Variable Value Field

## Step-by-Step: What Goes in the "Value" Field

### Step 1: Upload Your Video First

1. Go to `https://dashmemories.com/heaven/kobe-bryant` (or kelly-wong)
2. Click **"📹 Upload Video File"**
3. Select your video file
4. Wait for upload to complete
5. **Look for the permanent URL** - it will be one of these:

**If uploaded to Mux:**
```
https://stream.mux.com/ABC123xyz.m3u8
```

**If uploaded to Cloudinary:**
```
https://res.cloudinary.com/your-cloud-name/video/upload/v1234567890/kobe-bryant-1234567890.mp4
```

**If you used URL paste method:**
```
https://drive.google.com/uc?export=download&id=YOUR_FILE_ID
```

### Step 2: Copy That URL

**Copy the ENTIRE URL** - it should look like one of the examples above.

### Step 3: Paste in Vercel

1. Go to Vercel → Settings → Environment Variables
2. Find `NEXT_PUBLIC_KOBE_DEMO_VIDEO` (or KELLY)
3. Click to edit
4. In the **"Value"** field, **paste the URL you copied**
5. Click Save

---

## Example

**If your video URL is:**
```
https://stream.mux.com/abc123xyz.m3u8
```

**Then in Vercel:**
- **Key:** `NEXT_PUBLIC_KOBE_DEMO_VIDEO`
- **Value:** `https://stream.mux.com/abc123xyz.m3u8` ← Paste this entire thing

---

## Don't Have the URL Yet?

**Option 1: Upload via Webapp**
- Go to the demo page and upload
- Check browser console (F12) for the URL
- Or check the success message

**Option 2: Use Google Drive/Dropbox URL**
- Upload video to Google Drive
- Get share link
- Convert to direct link:
  - Share: `https://drive.google.com/file/d/FILE_ID/view`
  - Direct: `https://drive.google.com/uc?export=download&id=FILE_ID`
- Paste the direct link in Vercel

**Option 3: Use Any Public Video URL**
- If you have the video hosted anywhere (YouTube, Vimeo, etc.)
- Get the direct video file URL
- Paste that in Vercel

---

## Quick Answer

**In the "Value" field, paste:**
- The complete video URL (starts with `https://`)
- Examples:
  - `https://stream.mux.com/abc123.m3u8`
  - `https://res.cloudinary.com/.../video.mp4`
  - `https://drive.google.com/uc?export=download&id=FILE_ID`

**That's it!** Just the URL, nothing else.

