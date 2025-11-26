# 🧹 Cleanup Supabase Tables - What to Delete

## 🎯 Tables Currently in Your Database

Based on what you showed me, you have these tables:
- `ai_jobs`
- `avatars`
- `calls`
- `collaborators`
- `comments`
- `likes`
- `media`
- `messages`
- `profiles`
- `slideshow_media`
- `slideshows`
- `voices`

**Plus:** `heaven_characters` (needed for videos!)

---

## ✅ Tables You NEED to Keep

### 1. `heaven_characters` ✅ KEEP
**Why:**
- Stores video URLs for Heaven pages
- Used in: `/heaven/[name].tsx`, API routes
- **Critical for videos working!**

**Status:** ✅ **DO NOT DELETE**

---

### 2. `slideshow_media` ✅ KEEP (if using slideshow feature)
**Why:**
- Stores slideshow photos/videos
- Used in: `slideshow.tsx`

**Status:** ✅ **KEEP if you use slideshow feature**

---

### 3. `memorials` ✅ KEEP (if using account/memorial feature)
**Why:**
- Stores user memorials
- Used in: `account.tsx`, `supabase.ts`

**Status:** ✅ **KEEP if you use memorials/account feature**

---

## ✅ ALL TABLES ARE NEEDED

**Update:** After reviewing your full application, **ALL these tables are needed** for different features!

### Tables Required for Features:

- ✅ `ai_jobs` - AI processing jobs (Heaven AI features)
- ✅ `avatars` - Avatar creation (AI memorial avatars)
- ✅ `calls` - Voice call records (AI conversations)
- ✅ `collaborators` - Collaboration features (invite family/friends)
- ✅ `comments` - Comments on memorials
- ✅ `likes` - Likes on memorials
- ✅ `media` - Media files metadata
- ✅ `messages` - Messages/chat features
- ✅ `profiles` - User profiles (phone, email, Spotify)
- ✅ `voices` - Voice cloning data (AI features)
- ✅ `payments` - Stripe payment records
- ✅ `orders` - Orders linked to payments

---

## ⚠️ Before Deleting

### Double-Check These:

**If you're using slideshow feature:**
- ✅ Keep `slideshow_media`
- ❌ Can delete `slideshows` (if different table)

**If you're using account/memorial feature:**
- ✅ Keep `memorials`
- ❌ Can delete `profiles` (if not used)

---

## ⚠️ DO NOT DELETE TABLES

**All tables are needed!** See `COMPLETE_INTEGRATION_SETUP.md` for what each table is used for.

### Instead: Verify Tables Exist

**Run this SQL to check what tables you have:**

```sql
-- List all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

**If a table is missing, see `COMPLETE_INTEGRATION_SETUP.md` for SQL to create it.**

---

## ✅ Minimal Tables Needed

**For your current setup (videos only), you only need:**

1. ✅ `heaven_characters` - Stores video URLs

**That's it!** Just one table for videos to work.

---

## 📋 Recommended Cleanup

### Step 1: Check What You Actually Use

**Before deleting, verify:**

- [ ] Are you using slideshow feature? → Keep `slideshow_media`
- [ ] Are you using account/memorial feature? → Keep `memorials`
- [ ] Just videos? → Only need `heaven_characters`

### Step 2: Delete Unused Tables

**Run the SQL above** (or delete manually in Table Editor)

### Step 3: Verify

**After cleanup, you should only have:**
- ✅ `heaven_characters` (for videos)

**Plus any you actually use:**
- ✅ `slideshow_media` (if using slideshow)
- ✅ `memorials` (if using account feature)

---

## 🎯 Quick Decision Guide

**Question: What features do you use?**

**If only videos:**
- ✅ Keep: `heaven_characters`
- ❌ Delete: Everything else

**If videos + slideshow:**
- ✅ Keep: `heaven_characters`, `slideshow_media`
- ❌ Delete: Everything else

**If videos + slideshow + accounts:**
- ✅ Keep: `heaven_characters`, `slideshow_media`, `memorials`
- ❌ Delete: Everything else

---

## 🚀 Cleanup Steps

### Method 1: Delete in Table Editor (Easiest)

1. Go to Supabase → **Table Editor**
2. Click on a table you want to delete
3. Click **"..."** menu (top right)
4. Click **"Delete table"**
5. Confirm deletion
6. Repeat for each unused table

### Method 2: Delete via SQL (Faster)

1. Go to Supabase → **SQL Editor**
2. Copy the cleanup SQL above
3. Run it
4. Verify tables are deleted

---

## ✅ After Cleanup

**Your database will be clean with only:**
- ✅ Tables you actually use
- ✅ Less clutter
- ✅ Easier to manage
- ✅ Lower costs (if applicable)

---

## 🎯 Recommendation

**For your simple video setup:**

**Keep only:**
- ✅ `heaven_characters` (required for videos)

**Delete everything else** (unless you're using those features)

**This gives you a clean, minimal database!** ✅

