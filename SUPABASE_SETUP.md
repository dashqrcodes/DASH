# Supabase Setup Guide

## 📊 Your Supabase Instance

**URL:** `https://ftgrrlkjavcumjkyyyva.supabase.co`

## 🔧 Setup Steps

### 1. Get Your Supabase Anon Key

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy your **anon/public** key (starts with `eyJ...`)

### 2. Add to Environment Variables

Create or update `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://ftgrrlkjavcumjkyyyva.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3. Create Supabase Storage Bucket

In Supabase dashboard:
1. Go to **Storage**
2. Click **New Bucket**
3. Name: `heaven-assets`
4. Make it **Public** (for CDN access)
5. Click **Create**

### 4. Create Database Tables

Run these SQL commands in Supabase SQL Editor:

```sql
-- Memorials table
CREATE TABLE IF NOT EXISTS memorials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT,
  loved_one_name TEXT,
  sunrise_date TEXT,
  sunset_date TEXT,
  card_design JSONB,
  poster_design JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- HEAVEN characters table
CREATE TABLE IF NOT EXISTS heaven_characters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  memorial_id TEXT NOT NULL,
  voice_id TEXT,
  avatar_id TEXT,
  slideshow_video_url TEXT,
  primary_photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_memorials_user_id ON memorials(user_id);
CREATE INDEX IF NOT EXISTS idx_heaven_characters_user_memorial ON heaven_characters(user_id, memorial_id);
```

### 5. Set Storage Policies

In Supabase dashboard:
1. Go to **Storage** → **heaven-assets** → **Policies**
2. Add policy for **INSERT**:
   - Policy name: `Allow authenticated uploads`
   - Policy type: `INSERT`
   - Policy definition: `true` (or add auth check: `auth.uid() = user_id`)
3. Add policy for **SELECT**:
   - Policy name: `Allow public reads`
   - Policy type: `SELECT`
   - Policy definition: `true`

## 📦 What Supabase Stores

### Storage Bucket: `heaven-assets`
- `slideshow-videos/{userId}/{memorialId}-{timestamp}.mp4`
- `primary-photos/{userId}/{memorialId}-{timestamp}.jpg`
- `extracted-audio/{userId}/{memorialId}-{timestamp}.mp3`

### Database Tables
- **memorials**: Card/poster designs, user data
- **heaven_characters**: Voice IDs, avatar IDs, media URLs

## 🚀 Usage in Code

```typescript
import { supabase, uploadSlideshowVideo, storeHeavenCharacter } from '../utils/supabase';

// Upload video
const videoUrl = await uploadSlideshowVideo(file, userId, memorialId);

// Store character data
await storeHeavenCharacter({
  userId,
  memorialId,
  voiceId,
  avatarId,
  slideshowVideoUrl: videoUrl
});
```

## ✅ Verification

1. Check Supabase dashboard → **Storage** → `heaven-assets` bucket exists
2. Check **Database** → Tables → `memorials` and `heaven_characters` exist
3. Test upload: `npm run dev` → Upload a video → Check Supabase Storage

