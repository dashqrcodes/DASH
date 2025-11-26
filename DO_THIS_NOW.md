# 🎯 DO THIS RIGHT NOW (2 Steps!)

## Step 1: Get Your Video URL

**Where's your video?**
- Google Drive? → Get share link
- Already online? → Copy that URL

## Step 2: Run This Command

**Replace `YOUR_VIDEO_URL` with your actual URL:**

```bash
curl -X POST https://dashmemories.com/api/heaven/auto-setup-video \
  -H "Content-Type: application/json" \
  -d '{
    "name": "kobe-bryant",
    "googleDriveUrl": "YOUR_VIDEO_URL",
    "uploadToMux": true
  }'
```

**That's it!** The API will:
- Upload to Mux automatically
- Save to Supabase
- Video works immediately

**For Kelly Wong, change `"kobe-bryant"` to `"kelly-wong"`**

---

## Or Just Tell Me:

1. Where's your video? (Google Drive URL? Other?)
2. I'll give you the exact command to run!

