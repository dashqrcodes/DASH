# 📝 Step-by-Step: How to Use Video/Photo Upload

## 🎯 What You Can Do Right Now

### Step 1: Go to a Memorial Profile Page

1. **Open your app** (either locally or on Vercel)
2. **Navigate to any memorial profile page**:
   - URL format: `https://yourdomain.com/memorial/[name]`
   - Or: `http://localhost:3000/memorial/[name]`
   - Replace `[name]` with any name (e.g., `john-doe`, `test-memorial`)

   **If you don't have a memorial page yet:**
   - Go to `/create-memorial`
   - Fill out the form (name, dates, photo)
   - Click "Next" → This will create a memorial
   - Then go to `/memorial/[that-name]`

---

### Step 2: Click "Add Photos & Videos" Button

On the memorial profile page, you'll see a green button:
```
📤 Add Photos & Videos
```

Click it!

---

### Step 3: Choose Photo or Video

A modal will pop up with two tabs:
- **📷 Photo** - Upload images
- **🎥 Video** - Upload videos

Click whichever tab you want.

---

### Step 4a: Upload a Video (Mux)

1. Click the **"🎥 Video"** tab
2. Wait 1-2 seconds for "Loading uploader..." to finish
3. You'll see a drag-and-drop area or file picker
4. **Select a video file** (MP4, MOV, etc.)
5. Watch the upload progress bar
6. Once complete, you'll see "Video uploaded successfully!"
7. The video will appear in the slideshow (may take 10-30 seconds to process)

**What happens:**
- Video uploads directly to Mux (not your server)
- Gets a playback ID for streaming
- Added to slideshow automatically

---

### Step 4b: Upload a Photo (LocalStorage for now)

1. Click the **"📷 Photo"** tab
2. Click the upload area
3. **Select an image file** (JPG, PNG, etc.)
4. Photo appears in slideshow immediately

**Note:** Photos currently save to localStorage. We can connect this to Supabase next.

---

### Step 5: Play the Slideshow

1. Click **"▶ Play Slideshow"** button
2. Your uploaded photos/videos will play in order
3. Each slide shows for 3 seconds

---

## ✅ What Should Work

- ✅ Video upload to Mux
- ✅ Photo upload (localStorage)
- ✅ Videos appear in slideshow
- ✅ Photos appear in slideshow
- ✅ Play slideshow button works

---

## 🐛 If Something Doesn't Work

### Video upload fails:
1. **Check Vercel logs**:
   - Go to Vercel Dashboard → Your Project → Logs
   - Look for errors in `/api/mux/create-upload`

2. **Verify Mux credentials**:
   - Vercel Dashboard → Settings → Environment Variables
   - Make sure `MUX_TOKEN_ID` and `MUX_TOKEN_SECRET` are set

3. **Check browser console**:
   - Open browser DevTools (F12)
   - Look for errors in Console tab

### Photo upload doesn't save:
- Currently saves to localStorage only
- Refresh the page - photos should still be there (for this session)
- We need to connect to Supabase for permanent storage (next step)

---

## 🎯 Next Steps (After Testing)

Once uploads work, we can:

1. **Save to Supabase Database**:
   - Store video metadata (playback ID, asset ID)
   - Store photo URLs
   - Save to `media` table

2. **Load from Database**:
   - When memorial page loads, fetch media from Supabase
   - Show all uploaded photos/videos

3. **Connect Photo Upload to Supabase Storage**:
   - Upload photos to Supabase Storage bucket
   - Get permanent URLs

---

## 📍 Quick Test URLs

**Local:**
- `http://localhost:3000/memorial/test`
- `http://localhost:3000/create-memorial`

**Production:**
- `https://yourdomain.com/memorial/test`
- `https://yourdomain.com/create-memorial`

---

## 🎬 Video Upload Example Flow

```
1. User visits: /memorial/john-doe
2. Clicks: "📤 Add Photos & Videos"
3. Selects: "🎥 Video" tab
4. Chooses: video.mp4 file
5. Uploads: → Mux (direct upload)
6. Gets: playback ID from Mux
7. Added: to slideshow automatically
8. Plays: in slideshow when clicked
```

---

**That's it! Try it out and let me know if you encounter any issues.**

