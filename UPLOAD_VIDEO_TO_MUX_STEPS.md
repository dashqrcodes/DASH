# 🎬 Step-by-Step: Upload Video File to Mux

## ✅ What You Need
- Your video file (MP4, MOV, etc.)
- Mux credentials already set in Vercel (you said they're set!)

---

## 📋 Step 1: Go to Upload Page

**Open your browser and go to:**

```
http://localhost:3000/upload-kobe-video
```

**OR on production:**

```
https://dashmemories.com/upload-kobe-video
```

---

## 📋 Step 2: Select Your Video File

1. **Click the file input** that says "Select Video File"
2. **Browse** to find your video file on your computer
3. **Click** on your video file to select it
4. You'll see the file name and size appear below

---

## 📋 Step 3: Click Upload Button

1. **Click the green button** that says "Upload to Mux"
2. You'll see a progress bar appear
3. **Wait** - this may take a few minutes depending on file size

---

## 📋 Step 4: Wait for Processing

The upload page will:
- Upload your file to Mux (progress bar shows 0-50%)
- Wait for Mux to process the video (progress bar shows 50-100%)
- This usually takes 1-3 minutes

**Don't close the page!** Just wait.

---

## 📋 Step 5: Get Your Video URL

When it's done, you'll see:

```
✅ Upload Successful!

Video URL: https://stream.mux.com/ABC123xyz.m3u8
```

**This is your direct video URL!**

---

## 📋 Step 6: Copy the URL

1. **Click the "📋 Copy URL to Clipboard" button**
2. The URL is now copied

---

## 📋 Step 7: Save to Database (Automatic)

The upload page **automatically saves** to Supabase, so your video will work on:
```
https://dashmemories.com/heaven/kobe-bryant
```

**You don't need to do anything else!** It's already saved.

---

## ✅ Optional: Also Set in Vercel (Backup)

If you want, you can also paste the URL in Vercel as a backup:

1. Go to **Vercel Dashboard**
2. Your Project → **Settings** → **Environment Variables**
3. Add/Edit:
   - **Key**: `NEXT_PUBLIC_KOBE_DEMO_VIDEO`
   - **Value**: Paste the copied URL (starts with `https://stream.mux.com/`)
4. **Save**
5. **Redeploy**

---

## ✅ Test It!

Visit:
```
https://dashmemories.com/heaven/kobe-bryant
```

Your video should play! 🎉

---

## 🐛 If Upload Fails

**Check:**
1. Is your video file too large? (Max ~500MB)
2. Is Mux configured in Vercel? (You said it is!)
3. Check browser console (F12) for errors
4. Check Vercel logs for API errors

---

## 📝 Summary

1. Go to `/upload-kobe-video`
2. Select your video file
3. Click "Upload to Mux"
4. Wait for it to finish
5. Copy the URL
6. Done! Video works automatically

**That's it!** Simple and easy. 🚀

