# 🎯 Demo Day Guide - Supabase Setup

## ✅ Good News: App Works WITHOUT Supabase!

Your app is designed to work in **two modes**:

### 1. **LocalStorage Mode (Works Immediately - No Setup)**
- ✅ **Photos work** - Stored in browser localStorage
- ✅ **Slideshow playback works** - Full functionality
- ✅ **Music selection works** - Spotify, YouTube, custom upload
- ✅ **All UI features work** - Hamburger menu, bottom nav, etc.
- ⚠️ **Limitations:**
  - Photos only persist in that specific browser
  - Photos lost if browser data is cleared
  - Can't share slideshows across devices
  - No cloud backup

### 2. **Cloud Mode (Requires Supabase Setup)**
- ✅ Everything above PLUS:
- ✅ Photos stored in cloud (permanent)
- ✅ Share slideshows across devices
- ✅ Cloud backup and recovery
- ✅ HEAVEN feature assets storage

---

## 🚀 Quick Supabase Setup for Demo Day (15 minutes)

If you want cloud features for demo day, here's the fastest setup:

### Step 1: Create Supabase Project (5 min)
1. Go to [supabase.com](https://supabase.com)
2. Sign up/login (free tier is fine)
3. Click **"New Project"**
4. Fill in:
   - **Name**: `dash-memorials`
   - **Database Password**: (save this!)
   - **Region**: Choose closest to you
5. Click **"Create new project"** (takes ~2 minutes)

### Step 2: Get Your Keys (2 min)
1. In your Supabase project dashboard
2. Go to **Settings** → **API**
3. Copy:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

### Step 3: Add to Vercel (3 min)
1. Go to your Vercel project dashboard
2. **Settings** → **Environment Variables**
3. Add these two variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ... (your long key)
   ```
4. Make sure to select **Production**, **Preview**, and **Development**
5. Click **"Save"**

### Step 4: Create Database Tables (5 min)

Run this SQL in Supabase SQL Editor:

```sql
-- Create memorials table
CREATE TABLE IF NOT EXISTS memorials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  sunrise DATE,
  sunset DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create slideshow_media table
CREATE TABLE IF NOT EXISTS slideshow_media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  memorial_id TEXT NOT NULL,
  media_items JSONB NOT NULL,
  spotify_playlist JSONB,
  spotify_tracks JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create storage bucket for media
INSERT INTO storage.buckets (id, name, public)
VALUES ('slideshow-media', 'slideshow-media', true)
ON CONFLICT (id) DO NOTHING;

-- Set up Row Level Security (RLS)
ALTER TABLE memorials ENABLE ROW LEVEL SECURITY;
ALTER TABLE slideshow_media ENABLE ROW LEVEL SECURITY;

-- Allow public read/write for demo (you can restrict later)
CREATE POLICY "Allow public access" ON memorials FOR ALL USING (true);
CREATE POLICY "Allow public access" ON slideshow_media FOR ALL USING (true);
```

### Step 5: Redeploy (1 min)
1. Go to Vercel dashboard
2. Click **"Redeploy"** on your latest deployment
3. Wait for build to complete

---

## 🎬 Demo Day Recommendations

### Option A: Demo WITHOUT Supabase (Easiest)
**Best for:** Quick demos, single device demos

**Setup:**
- Nothing needed! Just deploy and demo
- Pre-load some photos in localStorage before demo
- Use one device/browser for entire demo

**Pros:**
- ✅ Zero setup time
- ✅ Works immediately
- ✅ No configuration needed

**Cons:**
- ⚠️ Photos only on that device
- ⚠️ Can't show cross-device sharing

### Option B: Demo WITH Supabase (Best Experience)
**Best for:** Full feature demos, showing cloud capabilities

**Setup:**
- Follow Quick Setup above (15 minutes)
- Test once before demo day
- Have backup device ready

**Pros:**
- ✅ Shows full cloud capabilities
- ✅ Can demo cross-device sharing
- ✅ More impressive for investors

**Cons:**
- ⚠️ Requires 15 min setup
- ⚠️ Need to test beforehand

---

## 🧪 Testing Before Demo Day

### Test Checklist:
1. ✅ App loads without errors
2. ✅ Can add photos to slideshow
3. ✅ Slideshow plays back correctly
4. ✅ Music selection works
5. ✅ Photos persist after page refresh
6. ✅ (If Supabase) Photos load from cloud
7. ✅ (If Supabase) Can access from different device

### Quick Test Script:
```bash
# 1. Deploy to Vercel
git push origin main

# 2. Visit your live URL
# 3. Add 3-5 test photos
# 4. Play slideshow
# 5. Refresh page - photos should still be there
# 6. (If Supabase) Check Supabase dashboard - should see data
```

---

## 🆘 Troubleshooting

### "Photos not persisting"
- **Check:** Browser localStorage (DevTools → Application → Local Storage)
- **Fix:** Make sure `slideshowMedia` key exists

### "Supabase errors in console"
- **Check:** Environment variables in Vercel
- **Fix:** Verify keys are correct and redeploy

### "App won't build"
- **Check:** Vercel build logs
- **Fix:** App should build even without Supabase (null guards in place)

---

## 📝 Summary

**For Demo Day:**
- ✅ **App works immediately** without Supabase (localStorage mode)
- ✅ **All core features work** - photos, slideshow, music
- ⚠️ **Cloud features require** Supabase setup (15 min)
- 🎯 **Recommendation:** Set up Supabase if you have time, otherwise demo works great in localStorage mode!

**The app is demo-ready RIGHT NOW** - Supabase just adds cloud persistence features.

