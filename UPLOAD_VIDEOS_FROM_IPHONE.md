# How to Upload Videos from iPhone to Hosting

## Method 1: Google Drive (Easiest & Free) ⭐ Recommended

### Step 1: Upload to Google Drive from iPhone

1. **Open Google Drive app** on your iPhone
   - Download from App Store if you don't have it
   - Sign in with your Google account

2. **Upload your videos:**
   - Tap the **"+"** button (bottom right)
   - Select **"Upload"**
   - Choose **"Photos and Videos"**
   - Select your Kobe Bryant video
   - Wait for upload to complete
   - Repeat for Kelly Wong video

3. **Get the share link:**
   - Tap on the uploaded video
   - Tap the **"Share"** icon (top right)
   - Tap **"Get link"**
   - Make sure it's set to **"Anyone with the link"**
   - Copy the link

### Step 2: Convert Google Drive Link to Direct Link

Google Drive share links need to be converted to direct download links.

**Your share link looks like:**
```
https://drive.google.com/file/d/FILE_ID/view?usp=sharing
```

**Convert it to direct link:**
```
https://drive.google.com/uc?export=download&id=FILE_ID
```

**To get the FILE_ID:**
- Copy the share link
- The FILE_ID is the long string between `/d/` and `/view`
- Example: `https://drive.google.com/file/d/1ABC123xyz/view`
  - FILE_ID = `1ABC123xyz`
  - Direct link = `https://drive.google.com/uc?export=download&id=1ABC123xyz`

### Step 3: Add to Vercel

1. Go to [vercel.com](https://vercel.com) on your computer
2. Select your DASH project
3. Go to **Settings** → **Environment Variables**
4. Add:
   ```
   NEXT_PUBLIC_KOBE_DEMO_VIDEO = https://drive.google.com/uc?export=download&id=YOUR_KOBE_FILE_ID
   NEXT_PUBLIC_KELLY_DEMO_VIDEO = https://drive.google.com/uc?export=download&id=YOUR_KELLY_FILE_ID
   ```
5. Set for: Production, Preview, Development
6. Save
7. Redeploy

---

## Method 2: Dropbox (Also Easy & Free)

### Step 1: Upload to Dropbox from iPhone

1. **Open Dropbox app** on your iPhone
   - Download from App Store if needed
   - Sign in

2. **Upload videos:**
   - Tap the **"+"** button (bottom center)
   - Select **"Upload Photos or Videos"**
   - Choose your videos
   - Wait for upload

3. **Get the link:**
   - Tap on the uploaded video
   - Tap **"Share"** (top right)
   - Tap **"Create link"**
   - Copy the link

### Step 2: Convert Dropbox Link to Direct Link

**Your share link looks like:**
```
https://www.dropbox.com/s/xxxxx/video.mp4?dl=0
```

**Change `?dl=0` to `?dl=1`:**
```
https://www.dropbox.com/s/xxxxx/video.mp4?dl=1
```

### Step 3: Add to Vercel

Same as Method 1, Step 3 above.

---

## Method 3: Direct Upload via Website (No Hosting Needed!)

If you can access the website from your iPhone, you can upload directly:

1. **Open Safari on your iPhone**
2. **Go to:**
   - `https://dashmemories.com/heaven/kobe-bryant`
   - Or `https://dashmemories.com/heaven/kelly-wong`

3. **Upload directly:**
   - Tap **"📹 Upload Video File"**
   - Select your video from Photos
   - Video will upload and play automatically

**Note:** This saves to browser localStorage, so it only works for that browser. For permanent hosting, use Method 1 or 2.

---

## Method 4: iCloud (If You Have iCloud)

### Step 1: Upload to iCloud

1. **Open Photos app** on iPhone
2. **Select your video**
3. **Tap Share** → **"Add to iCloud Drive"**
4. **Choose a folder** (or create new)
5. **Upload**

### Step 2: Get Share Link

1. **Open Files app** on iPhone
2. **Go to iCloud Drive**
3. **Find your video**
4. **Long press** → **Share** → **Copy Link**

### Step 3: Add to Vercel

Use the iCloud share link directly in Vercel environment variables.

---

## Method 5: AirDrop to Computer, Then Upload

If you have a Mac:

1. **AirDrop videos** from iPhone to Mac
2. **Open Google Drive** in browser on Mac
3. **Upload videos** to Google Drive
4. **Get share links** and convert (see Method 1)

---

## Quick Checklist

- [ ] Videos are 9:16 aspect ratio (portrait/vertical)
- [ ] Videos are MP4 format
- [ ] Videos are uploaded to hosting service
- [ ] Direct download links obtained
- [ ] Environment variables added to Vercel
- [ ] Vercel project redeployed
- [ ] Tested URLs:
  - `https://dashmemories.com/heaven/kobe-bryant`
  - `https://dashmemories.com/heaven/kelly-wong`

---

## Troubleshooting

**"Video won't play"**
- Make sure link is direct download link (not sharing page)
- Test link in browser first (should download/play)
- Check video format is MP4

**"Upload taking too long"**
- Use WiFi (not cellular data)
- Compress videos if they're very large (>100MB)
- Try uploading one at a time

**"Can't find FILE_ID in Google Drive link"**
- The FILE_ID is the long string between `/d/` and `/view`
- Example: `.../d/1aB2cD3eF4gH5iJ6kL7mN8oP9qR/view`
  - FILE_ID = `1aB2cD3eF4gH5iJ6kL7mN8oP9qR`

---

## Need Help?

If you get stuck:
1. Try Method 3 (direct upload via website) - it's the fastest
2. Or use Method 1 (Google Drive) - it's the most reliable
3. Make sure videos are in portrait mode (9:16)


