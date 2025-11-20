# 🚀 Complete Supabase Setup for DASH Webapp

This guide will help you set up Supabase for the entire DASH application, including database tables, storage buckets, and security policies.

## 📋 Prerequisites

1. **Supabase Account**
   - Sign up at [supabase.com](https://supabase.com)
   - Create a new project

2. **Get Your Credentials**
   - Go to **Settings** → **API**
   - Copy your **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - Copy your **anon/public key** (starts with `eyJ...`)

---

## 🗄️ Step 1: Database Setup

### Option A: Complete Setup (Recommended)

Use the complete SQL file that includes everything:

1. **Go to Supabase Dashboard**
   - Navigate to **SQL Editor**
   - Click **"New query"**

2. **Copy and Paste**
   - Open `SUPABASE_COPY_PASTE.sql` from this repo
   - Copy **ALL** the SQL code
   - Paste into Supabase SQL Editor
   - Click **"Run"** (or press `Ctrl+Enter` / `Cmd+Enter`)

This will create:
- ✅ All core tables (media, calls, avatars, voices, slideshows, etc.)
- ✅ Business tables (orders, payments, deliveries, vendors, etc.)
- ✅ AI jobs table (for background processing)
- ✅ All indexes for performance
- ✅ Row Level Security (RLS) policies
- ✅ Triggers for auto-updating timestamps

### Option B: Step-by-Step Setup

If you prefer to set up incrementally:

1. **Core Tables First:**
   - Run `supabase-setup.sql` (basic tables)

2. **Business Tables:**
   - Run `SUPABASE_BUSINESS_TABLES.sql` (orders, payments, etc.)

3. **Complete Setup:**
   - Run `SUPABASE_COPY_PASTE.sql` (everything together)

---

## 📦 Step 2: Storage Buckets Setup

### Create Storage Buckets

1. **Go to Supabase Dashboard**
   - Navigate to **Storage**
   - Click **"New bucket"**

2. **Create `heaven-assets` Bucket**
   - **Name:** `heaven-assets`
   - **Public bucket:** ✅ Check this (for demo videos and public assets)
   - Click **"Create bucket"**

3. **Create `memorials` Bucket** (Optional, for user memorials)
   - **Name:** `memorials`
   - **Public bucket:** ✅ Check this (for public memorial photos)
   - Click **"Create bucket"**

### Set Storage Policies

1. **Go to Storage → `heaven-assets` → Policies**

2. **Add Public Read Policy:**
   - Click **"New Policy"**
   - **Policy name:** `Public read access`
   - **Allowed operation:** `SELECT`
   - **Policy definition:** `true`
   - Click **"Save"**

3. **Add Upload Policy:**
   - Click **"New Policy"**
   - **Policy name:** `Authenticated uploads`
   - **Allowed operation:** `INSERT`
   - **Policy definition:** `true` (or `auth.role() = 'authenticated'`)
   - Click **"Save"**

---

## 🔐 Step 3: Environment Variables

### Local Development (`.env.local`)

Create or update `.env.local` in your project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Optional: Admin secret for demo video uploads
HEAVEN_DEMO_UPLOAD_SECRET=your-secret-token-here

# Other services (if using)
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Production (Vercel)

1. **Go to Vercel Dashboard**
   - Select your project
   - Go to **Settings** → **Environment Variables**

2. **Add Variables:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

3. **Select Environments:**
   - ✅ Production
   - ✅ Preview
   - ✅ Development

4. **Click "Save"**

5. **Redeploy** your project

---

## ✅ Step 4: Verification

### Check Database Tables

1. **Go to Supabase Dashboard**
   - Navigate to **Table Editor**
   - Verify these tables exist:
     - ✅ `media`
     - ✅ `calls`
     - ✅ `avatars`
     - ✅ `voices`
     - ✅ `slideshows`
     - ✅ `slideshow_media`
     - ✅ `orders`
     - ✅ `payments`
     - ✅ `deliveries`
     - ✅ `ai_jobs`
     - ✅ And more...

### Check Storage Buckets

1. **Go to Storage**
   - Verify `heaven-assets` bucket exists
   - Verify it's **Public**
   - Test upload: Click **"Upload file"** → Upload a test image

### Test Connection

1. **Run your app:**
   ```bash
   npm run dev
   ```

2. **Check browser console:**
   - Should see: `✅ Supabase connected`
   - No errors about missing Supabase keys

3. **Test upload:**
   - Go to slideshow page
   - Upload a photo
   - Check Supabase Storage → `heaven-assets` bucket
   - Photo should appear there

---

## 📊 What Supabase Stores

### Database Tables

**Core Features:**
- `media` - Photos, videos, audio files
- `slideshows` - Slideshow collections
- `slideshow_media` - Media items in slideshows
- `calls` - HEAVEN call logs
- `avatars` - AI avatar data
- `voices` - AI voice clone data
- `messages` - Chat/transcript messages
- `profiles` - User profiles
- `collaborators` - Shared access
- `comments` - Social comments
- `likes` - Social likes

**Business Operations:**
- `orders` - Print orders (cards, posters)
- `payments` - Stripe payment records
- `deliveries` - Delivery tracking
- `vendors` - Print shops/vendors
- `pdfs` - Generated PDF files
- `notifications` - User notifications
- `ai_jobs` - Background AI processing tasks

### Storage Buckets

**`heaven-assets`:**
- `demo-videos/` - HEAVEN demo videos
- `slideshow-videos/` - User slideshow videos
- `primary-photos/` - Primary memorial photos
- `extracted-audio/` - Extracted audio for voice cloning

**`memorials`:**
- `slideshow-photos/` - User memorial photos
- `slideshow-videos/` - User memorial videos

---

## 🔒 Security Features

### Row Level Security (RLS)

All tables have RLS enabled with policies that:
- ✅ Users can only access their own data
- ✅ Public read access for profiles, comments, likes
- ✅ Authenticated users can insert their own records
- ✅ System can update certain tables (payments, deliveries)

### Storage Security

- ✅ Public buckets for demo/public content
- ✅ Authenticated uploads only
- ✅ Signed URLs available for private content

---

## 🚀 Next Steps

1. ✅ **Database:** Run `SUPABASE_COPY_PASTE.sql`
2. ✅ **Storage:** Create `heaven-assets` bucket (public)
3. ✅ **Environment:** Add variables to Vercel
4. ✅ **Test:** Upload a photo and verify it appears in Supabase
5. ✅ **Demo Videos:** Upload demo videos (see `SUPABASE_DEMO_VIDEO_SETUP.md`)

---

## 📝 Troubleshooting

### "Supabase not configured" Error

**Solution:**
- ✅ Check environment variables are set in Vercel
- ✅ Verify variable names match exactly (case-sensitive)
- ✅ Redeploy after adding variables

### "Bucket not found" Error

**Solution:**
- ✅ Create `heaven-assets` bucket in Supabase
- ✅ Make it **Public**
- ✅ Verify bucket name matches code (`heaven-assets`)

### "Permission denied" Error

**Solution:**
- ✅ Check RLS policies are created
- ✅ Verify user is authenticated
- ✅ Check storage bucket policies

### Tables Not Appearing

**Solution:**
- ✅ Run SQL in Supabase SQL Editor (not local file)
- ✅ Check for SQL errors in Supabase dashboard
- ✅ Verify extensions are enabled (`uuid-ossp`)

---

## 📚 Additional Resources

- **Demo Video Setup:** See `SUPABASE_DEMO_VIDEO_SETUP.md`
- **Secure Upload:** See `HEAVEN_DEMO_VIDEO_SECURE_UPLOAD.md`
- **Supabase Docs:** [supabase.com/docs](https://supabase.com/docs)

---

## ✅ Checklist

- [ ] Supabase project created
- [ ] Database tables created (run SQL)
- [ ] Storage buckets created (`heaven-assets`, `memorials`)
- [ ] Storage policies set (public read, authenticated upload)
- [ ] Environment variables added to Vercel
- [ ] Environment variables added to `.env.local`
- [ ] App tested locally
- [ ] Upload tested (photo appears in Supabase)
- [ ] Production deployment tested

**You're all set!** 🎉

