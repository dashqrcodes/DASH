# ✅ Use Your Existing Mux Video!

You already have a video on Mux! Playback ID: `rR8P8mSaKDzz02TsftugTUdI00cQPJX00oy`

## 🚀 Quick Setup (Choose One):

### Option 1: Save to Supabase Database (Recommended)

**Run this SQL in Supabase:**

```sql
INSERT INTO public.heaven_characters (
  user_id,
  character_id,
  slideshow_video_url
) VALUES (
  'demo',
  'kobe-bryant',
  'https://stream.mux.com/rR8P8mSaKDzz02TsftugTUdI00cQPJX00oy.m3u8'
)
ON CONFLICT (user_id, memorial_id) 
DO UPDATE SET 
  slideshow_video_url = EXCLUDED.slideshow_video_url,
  updated_at = now();
```

**Or for Kelly Wong:**

```sql
INSERT INTO public.heaven_characters (
  user_id,
  character_id,
  slideshow_video_url
) VALUES (
  'demo',
  'kelly-wong',
  'https://stream.mux.com/rR8P8mSaKDzz02TsftugTUdI00cQPJX00oy.m3u8'
)
ON CONFLICT (user_id, memorial_id) 
DO UPDATE SET 
  slideshow_video_url = EXCLUDED.slideshow_video_url,
  updated_at = now();
```

### Option 2: Use the API

```bash
curl -X POST https://dashmemories.com/api/heaven/set-video-url \
  -H "Content-Type: application/json" \
  -d '{
    "name": "kobe-bryant",
    "videoUrl": "https://stream.mux.com/rR8P8mSaKDzz02TsftugTUdI00cQPJX00oy.m3u8"
  }'
```

---

## ✅ Your Mux Video Info:

**Playback ID:** `rR8P8mSaKDzz02TsftugTUdI00cQPJX00oy`

**HLS URL (for video player):**
```
https://stream.mux.com/rR8P8mSaKDzz02TsftugTUdI00cQPJX00oy.m3u8
```

**Thumbnail:**
```
https://image.mux.com/rR8P8mSaKDzz02TsftugTUdI00cQPJX00oy/thumbnail.png
```

---

## 🎯 That's It!

Just save that Mux URL to Supabase and your video will work immediately!

