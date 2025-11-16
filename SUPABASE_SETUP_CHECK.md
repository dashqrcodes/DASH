# Supabase Connection Status & Setup Guide

## ✅ Current Status

### Supabase Client Configuration
- **File**: `src/utils/supabase.ts`
- **Status**: ✅ Configured
- **URL**: `https://ftgrrlkjavcumjkyyyva.supabase.co` (hardcoded fallback)
- **Anon Key**: ⚠️ Needs to be set via environment variable

### Required Environment Variables

For **local development** (`.env.local`):
```env
NEXT_PUBLIC_SUPABASE_URL=https://ftgrrlkjavcumjkyyyva.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

For **production** (Vercel Environment Variables):
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://ftgrrlkjavcumjkyyyva.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `your_anon_key_here`

### How to Get Your Supabase Anon Key

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project (or create one)
3. Go to **Settings** → **API**
4. Copy the **anon/public** key
5. Add it to your environment variables

## 🗄️ Database Tables Required

The app expects these Supabase tables:

### 1. `memorials`
```sql
CREATE TABLE memorials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT,
  name TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 2. `slideshow_media`
```sql
CREATE TABLE slideshow_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT,
  memorial_id TEXT,
  media_items JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 3. `heaven_characters`
```sql
CREATE TABLE heaven_characters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT,
  memorial_id TEXT,
  voice_id TEXT,
  avatar_id TEXT,
  slideshow_video_url TEXT,
  primary_photo_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 📦 Storage Buckets Required

### 1. `memorials` bucket
- For storing slideshow photos/videos
- Public access enabled

### 2. `heaven-assets` bucket
- For storing HEAVEN-related assets (videos, photos, audio)
- Public access enabled

## ✅ Verification Steps

1. **Check Supabase Connection**:
   ```bash
   # Test the connection
   npm run dev
   # Visit http://localhost:3000/api/test-supabase
   ```

2. **Verify Environment Variables**:
   - Check browser console for warnings
   - Should NOT see: `⚠️ NEXT_PUBLIC_SUPABASE_ANON_KEY not set`

3. **Test Storage Upload**:
   - Try uploading a photo in slideshow
   - Check Supabase Storage dashboard for files

## 🚀 For Production (dashmemories.com)

### Vercel Environment Variables Setup

1. **Go to Vercel Dashboard**
2. **Select your project**
3. **Settings → Environment Variables**
4. **Add these variables for Production environment**:

```
NEXT_PUBLIC_SUPABASE_URL=https://ftgrrlkjavcumjkyyyva.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key
NEXT_PUBLIC_BASE_URL=https://dashmemories.com
```

5. **Redeploy** after adding variables

### Domain Configuration

1. **In Vercel Dashboard**:
   - Go to Settings → Domains
   - Add `dashmemories.com`
   - Follow DNS configuration instructions

2. **Update Supabase Settings**:
   - Go to Supabase Dashboard → Settings → API
   - Add `https://dashmemories.com` to allowed origins (if needed)

## 🔍 Current Implementation

The app uses Supabase for:
- ✅ Storing slideshow media metadata
- ✅ Storing HEAVEN character data
- ✅ Uploading photos/videos to storage
- ✅ Retrieving saved slideshows

## ⚠️ Important Notes

1. **Anon Key is Public**: The `NEXT_PUBLIC_SUPABASE_ANON_KEY` is safe to expose in client-side code. Supabase uses Row Level Security (RLS) for protection.

2. **Storage Buckets**: Make sure buckets are created and have proper permissions:
   - Public read access for media files
   - Authenticated write access

3. **Row Level Security**: Consider enabling RLS on tables for production security.

