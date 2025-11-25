# 🎬 Kobe Bryant Video Setup

## ✅ Video URL Set!

**Google Drive Link:**
```
https://drive.google.com/file/d/1mwXwubTJtD8yopRTzTm7MMoShV25JO62/view
```

**Direct Download URL (for video player):**
```
https://drive.google.com/uc?export=download&id=1mwXwubTJtD8yopRTzTm7MMoShV25JO62
```

---

## 🚀 Quick Setup Methods

### Method 1: Browser Console (Instant - Works Now!)

1. **Go to:** https://dashmemories.com/heaven/kobe-bryant
2. **Open Browser Console:**
   - Safari: `Cmd+Option+C` (after enabling Develop menu)
   - Chrome: `F12` or `Cmd+Option+I`
3. **Paste this code:**
```javascript
fetch('/api/heaven/set-video-url', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'kobe-bryant',
    videoUrl: 'https://drive.google.com/uc?export=download&id=1mwXwubTJtD8yopRTzTm7MMoShV25JO62',
    uploadToMux: false
  })
})
.then(r => r.json())
.then(d => {
  console.log('✅ Done!', d);
  localStorage.setItem('heaven_video_kobe-bryant', d.videoUrl);
  setTimeout(() => window.location.reload(), 1000);
});
```
4. **Press Enter** - Video will load!

---

### Method 2: Vercel Environment Variable (Permanent)

1. **Go to:** https://vercel.com/dashboard
2. **Select project:** `nextjs-auth-app` or `DASH`
3. **Go to:** Settings → Environment Variables
4. **Add New:**
   - **Key:** `NEXT_PUBLIC_KOBE_DEMO_VIDEO`
   - **Value:** `https://drive.google.com/uc?export=download&id=1mwXwubTJtD8yopRTzTm7MMoShV25JO62`
   - **Environment:** All (Production, Preview, Development)
5. **Save** and **Redeploy**

---

### Method 3: Just Paste URL on Page (Easiest!)

1. **Go to:** https://dashmemories.com/heaven/kobe-bryant
2. **Paste this URL** in the text box:
   ```
   https://drive.google.com/uc?export=download&id=1mwXwubTJtD8yopRTzTm7MMoShV25JO62
   ```
3. **Click "✨ Load Video"**
4. **Done!** ✅

---

## 📝 Code Already Updated

The code has been updated with the video URL as the default fallback, so if no environment variable is set, it will use this video.

**File:** `src/pages/heaven/[name].tsx`
- Default video URL now points to your Google Drive video
- Will work immediately on the page

---

## 🎯 Recommended: Method 3

Just go to the page and paste the URL - it's the easiest! The redesigned page is now live with a beautiful new UI.

