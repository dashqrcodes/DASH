# 📋 SUPABASE SETUP - COPY & PASTE GUIDE

## ✅ STEP 1: Copy SQL Code

**File:** `SUPABASE_COPY_PASTE.sql`

Copy the entire file contents.

## 🚀 STEP 2: Paste into Supabase

1. **Go to:** https://supabase.com/dashboard
2. **Select your project:** `ftgrrlkjavcumjkyyyva.supabase.co`
3. **Click:** SQL Editor (left sidebar)
4. **Click:** New Query
5. **Paste:** Copy entire contents of `SUPABASE_COPY_PASTE.sql`
6. **Click:** Run (or press Cmd/Ctrl + Enter)
7. **Verify:** Should see "Success. No rows returned"

## ✅ STEP 3: Verify Tables Created

1. **Click:** Table Editor (left sidebar)
2. **Check:** You should see 11 tables:
   - ✅ `media` (photos, videos, audio)
   - ✅ `calls` (Heaven call logs)
   - ✅ `avatars` (AI avatars)
   - ✅ `voices` (AI voice clones)
   - ✅ `slideshows` (slideshow collections)
   - ✅ `slideshow_media` (join table)
   - ✅ `messages` (call transcripts)
   - ✅ `profiles` (user profiles)
   - ✅ `collaborators` (shared editing)
   - ✅ `comments` (social comments)
   - ✅ `likes` (social likes)

## 🗂️ STEP 4: Create Storage Bucket

1. **Click:** Storage (left sidebar)
2. **Click:** New Bucket
3. **Name:** `heaven-assets`
4. **Public bucket:** ✅ CHECK THIS
5. **Click:** Create Bucket

## 🔐 STEP 5: Set Storage Policies

1. **Click:** `heaven-assets` bucket
2. **Click:** Policies tab
3. **Add 4 policies:**

### Policy 1: Public Reads
- **Name:** `Allow public reads`
- **Type:** `SELECT`
- **Definition:** `true`
- **Save**

### Policy 2: Authenticated Uploads
- **Name:** `Allow authenticated uploads`
- **Type:** `INSERT`
- **Definition:** `true`
- **Save**

### Policy 3: Update Own Files
- **Name:** `Allow own file updates`
- **Type:** `UPDATE`
- **Definition:** `true`
- **Save**

### Policy 4: Delete Own Files
- **Name:** `Allow own file deletes`
- **Type:** `DELETE`
- **Definition:** `true`
- **Save**

## 🔑 STEP 6: Get API Key

1. **Click:** Settings (gear icon) → **API**
2. **Find:** Project API keys
3. **Copy:** `anon/public` key (starts with `eyJ...`)

## 📝 STEP 7: Add to .env.local

Create/update `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://ftgrrlkjavcumjkyyyva.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=paste_your_key_here
```

## ✅ DONE!

Test connection: Visit `http://localhost:3000/api/test-supabase`

## 📊 Schema Overview

- **media**: Stores photos, videos, audio files
- **calls**: Heaven call logs and transcripts
- **avatars**: AI avatar references
- **voices**: AI voice clone references
- **slideshows**: Slideshow collections
- **slideshow_media**: Links media to slideshows
- **messages**: Chat/transcript messages in calls
- **profiles**: User profile information
- **collaborators**: Shared editing permissions
- **comments**: Social comments on media
- **likes**: Social likes on media

All tables use `auth.uid()` for Row Level Security (RLS) to ensure users can only access their own data.
