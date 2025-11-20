# How to Upload Videos from Laptop to Webapp

## Method 1: Upload via HEAVEN Demo Pages (Easiest) ⭐

### Step 1: Go to the Demo Page
Open your browser and go to:
- `https://dashmemories.com/heaven/kobe-bryant`
- Or `https://dashmemories.com/heaven/kelly-wong`

### Step 2: Upload Your Video
1. Click the **"📹 Upload Video File"** button
2. Select your video file from your laptop
3. Wait for upload (it will upload to Mux/Cloudinary if configured, or localStorage)
4. Video will play automatically!

**That's it!** The video is now in the webapp.

---

## Method 2: Upload via Slideshow Page

### Step 1: Go to Slideshow
1. Go to `https://dashmemories.com/slideshow`
2. Or create a new dash from the account page

### Step 2: Add Video
1. Click the **"+"** button in the bottom navigation bar
2. Select your video file
3. Video will be added to the slideshow
4. It will upload to Mux/Cloudinary automatically

---

## Method 3: Use the API Directly (For Developers)

If you want to upload programmatically or via command line:

### Using curl:
```bash
curl -X POST https://dashmemories.com/api/heaven/upload-to-mux \
  -F "video=@/path/to/your/video.mp4" \
  -F "name=kobe-bryant"
```

### Using a simple HTML form:
Create a file `upload.html`:
```html
<!DOCTYPE html>
<html>
<head>
  <title>Upload Demo Video</title>
</head>
<body>
  <h1>Upload HEAVEN Demo Video</h1>
  <form action="https://dashmemories.com/api/heaven/upload-to-mux" method="post" enctype="multipart/form-data">
    <label>
      Demo Name:
      <input type="text" name="name" value="kobe-bryant" required>
    </label>
    <br><br>
    <label>
      Video File:
      <input type="file" name="video" accept="video/*" required>
    </label>
    <br><br>
    <button type="submit">Upload</button>
  </form>
</body>
</html>
```

Open this HTML file in your browser and upload!

---

## Method 4: Drag & Drop (If We Add It)

I can add drag-and-drop functionality to the upload pages. Would you like me to add that?

---

## Quick Steps Summary

**Easiest Way:**
1. Go to `https://dashmemories.com/heaven/kobe-bryant`
2. Click "Upload Video File"
3. Select your video
4. Done!

**For Slideshow:**
1. Go to `https://dashmemories.com/slideshow`
2. Click the "+" button
3. Select your video
4. Done!

---

## Video Requirements

- **Format:** MP4 (H.264) recommended
- **Aspect Ratio:** 9:16 (portrait) for HEAVEN demos
- **Size:** Up to 500MB (Mux can handle large files)
- **Duration:** Any length

---

## Troubleshooting

**"Upload button not working"**
- Make sure you're using a modern browser (Chrome, Firefox, Safari, Edge)
- Check browser console (F12) for errors

**"Upload taking too long"**
- Large files take time - be patient
- Use WiFi for faster upload
- Check your internet connection

**"Video not playing after upload"**
- Wait a few seconds for processing (Mux needs time to transcode)
- Refresh the page
- Check browser console for errors

**"Want to upload multiple videos"**
- Upload them one at a time
- Or I can create a batch upload feature if needed

---

## Need Help?

If you get stuck:
1. Try Method 1 (HEAVEN demo page) - it's the simplest
2. Check browser console (F12) for error messages
3. Make sure your video is in the right format (MP4)

