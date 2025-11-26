# 🎬 Simple Video Setup (2 Steps!)

## The Easiest Way: Just Update Supabase!

Your code **already reads from Supabase first**, so you don't need to mess with Vercel environment variables.

---

## Step 1: Get Your Video URL

**Where's your video currently?**
- ✅ Already on `https://www.dashqrcodes.com/heaven-kobe-bryant`? → Use that URL!
- ✅ On Google Drive? → Get the share link
- ✅ On your laptop? → Upload it somewhere first (Google Drive, Dropbox, etc.)

**Example URLs that work:**
- `https://www.dashqrcodes.com/heaven-kobe-bryant`
- `https://drive.google.com/uc?export=download&id=FILE_ID`
- Any direct video file URL

---

## Step 2: Update Supabase (That's It!)

1. **Go to Supabase Dashboard** → **Table Editor** → **heaven_characters**
2. **Find the row** where:
   - `user_id` = `'demo'` 
   - `character_id` = `'kobe-bryant'` (or `'kelly-wong'`)
3. **Click to edit**
4. **Paste your video URL** in the `slideshow_video_url` field
5. **Save**

**Done!** ✅ The video will work immediately.

---

## If the Row Doesn't Exist:

**Just run this SQL in Supabase SQL Editor:**

```sql
INSERT INTO public.heaven_characters (
  user_id, 
  character_id, 
  slideshow_video_url
) VALUES (
  'demo',
  'kobe-bryant',
  'YOUR_VIDEO_URL_HERE'
)
ON CONFLICT (user_id, memorial_id) 
DO UPDATE SET 
  slideshow_video_url = EXCLUDED.slideshow_video_url;
```

---

## That's Literally It! 🎉

No Vercel, no environment variables, no uploads needed. Just:
1. Get URL
2. Paste in Supabase
3. Done!

---

## Questions?

**Q: What if I want to use environment variables instead?**  
A: You can, but Supabase is easier and the code checks it first anyway.

**Q: Do I need to upload the video somewhere?**  
A: Only if it's on your laptop. If it's already online, just use that URL.

**Q: Will it work immediately?**  
A: Yes! The page checks Supabase every time it loads.

