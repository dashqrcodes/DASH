# How to Use Method 3: API Endpoint

## ❌ NOT Supabase SQL Editor!

The API endpoint is an **HTTP request**, not SQL code.

---

## ✅ How to Use It:

### **Option A: Using Browser Console (Easiest)**

1. **Go to:** https://dashmemories.com/heaven/kobe-bryant
2. **Open Browser Console:**
   - Press `F12` (or `Cmd+Option+I` on Mac)
   - Click the **Console** tab
3. **Paste and run this:**
```javascript
fetch('/api/heaven/set-video-url', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'kobe-bryant',
    videoUrl: 'https://your-video-url-here.com/video.mp4',
    uploadToMux: false
  })
})
.then(res => res.json())
.then(data => {
  console.log('✅ Success!', data);
  alert('Video URL set! Check console for details.');
  location.reload(); // Reload page to see video
})
.catch(err => {
  console.error('❌ Error:', err);
  alert('Error: ' + err.message);
});
```

4. **Replace** `'https://your-video-url-here.com/video.mp4'` with your actual video URL
5. **Press Enter** to run
6. **Done!** Page will reload and show your video

---

### **Option B: Using Terminal (Command Line)**

**On Mac/Linux:**
```bash
curl -X POST https://dashmemories.com/api/heaven/set-video-url \
  -H "Content-Type: application/json" \
  -d '{
    "name": "kobe-bryant",
    "videoUrl": "https://your-video-url-here.com/video.mp4",
    "uploadToMux": false
  }'
```

**On Windows (PowerShell):**
```powershell
curl.exe -X POST https://dashmemories.com/api/heaven/set-video-url `
  -H "Content-Type: application/json" `
  -d '{\"name\": \"kobe-bryant\", \"videoUrl\": \"https://your-video-url-here.com/video.mp4\", \"uploadToMux\": false}'
```

---

### **Option C: Using Postman or Similar Tool**

1. Open Postman (or similar HTTP client)
2. Method: **POST**
3. URL: `https://dashmemories.com/api/heaven/set-video-url`
4. Headers: `Content-Type: application/json`
5. Body (raw JSON):
```json
{
  "name": "kobe-bryant",
  "videoUrl": "https://your-video-url-here.com/video.mp4",
  "uploadToMux": false
}
```
6. Click **Send**

---

## 📝 Example with Real Video URL:

If your video is on Google Drive:
```javascript
fetch('/api/heaven/set-video-url', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'kobe-bryant',
    videoUrl: 'https://drive.google.com/uc?export=download&id=YOUR_FILE_ID',
    uploadToMux: false
  })
}).then(res => res.json()).then(console.log);
```

---

## 🎯 Recommended: Use Method 1 (Page Upload) Instead

**Even easier:** Just go to https://dashmemories.com/heaven/kobe-bryant and paste your video URL in the form on the page! No code needed.

The API method is only useful if you want to automate it or set it programmatically.

