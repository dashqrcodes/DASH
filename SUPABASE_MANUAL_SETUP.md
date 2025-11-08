# Complete Supabase Setup Guide for DASH/HEAVEN

## ✅ What VS Code Copilot Can Do (Code Generation)
- ✅ SQL scripts (provided below)
- ✅ TypeScript integration code
- ✅ API route examples
- ✅ Helper functions

## 👤 What YOU Need to Do (Manual Steps)

### Step 1: Create Tables in Supabase ✅

**Action:** Run SQL script in Supabase Dashboard

1. Go to: https://supabase.com/dashboard
2. Select your project: `ftgrrlkjavcumjkyyyva.supabase.co`
3. Click **SQL Editor** in left sidebar
4. Click **New Query**
5. Copy and paste contents of `supabase-setup.sql`
6. Click **Run** (or press Cmd/Ctrl + Enter)
7. Verify: Check **Table Editor** → You should see 4 tables:
   - `memorials`
   - `heaven_characters`
   - `slideshow_media`
   - `orders`

---

### Step 2: Enable RLS and Add Policies ✅

**Action:** Already included in SQL script above

The SQL script automatically:
- ✅ Enables RLS on all tables
- ✅ Creates policies for SELECT, INSERT, UPDATE, DELETE
- ✅ Allows users to manage their own data

**Verify:** Go to **Authentication** → **Policies** → Check each table has policies

**Note:** Policies currently allow all reads/writes. For production, update policies to use `auth.uid() = user_id` when you add authentication.

---

### Step 3: Create Storage Bucket ✅

**Action:** Create storage bucket in Supabase Dashboard

1. Go to: https://supabase.com/dashboard → Your project
2. Click **Storage** in left sidebar
3. Click **New Bucket**
4. Fill in:
   - **Name:** `heaven-assets`
   - **Public bucket:** ✅ **Check this** (for CDN access)
   - **File size limit:** `100 MB` (or leave default)
   - **Allowed MIME types:** Leave empty (allow all)
5. Click **Create Bucket**

**Verify:** You should see `heaven-assets` bucket in Storage list

---

### Step 4: Configure Storage Policies ✅

**Action:** Set up storage bucket policies

1. Click on `heaven-assets` bucket
2. Click **Policies** tab
3. Click **New Policy**

**Policy 1: Allow Public Reads**
- **Policy Name:** `Allow public reads`
- **Policy Type:** `SELECT`
- **Policy Definition:** `true`
- Click **Save**

**Policy 2: Allow Authenticated Uploads**
- **Policy Name:** `Allow authenticated uploads`
- **Policy Type:** `INSERT`
- **Policy Definition:** `true` (or use auth check: `auth.uid()::text = (storage.foldername(name))[1]`)
- Click **Save**

**Policy 3: Allow Own File Updates**
- **Policy Name:** `Allow own file updates`
- **Policy Type:** `UPDATE`
- **Policy Definition:** `true`
- Click **Save**

**Policy 4: Allow Own File Deletes**
- **Policy Name:** `Allow own file deletes`
- **Policy Type:** `DELETE`
- **Policy Definition:** `true`
- Click **Save**

---

### Step 5: Get Supabase Anon Key ✅

**Action:** Copy your API key

1. Go to: https://supabase.com/dashboard → Your project
2. Click **Settings** (gear icon) → **API**
3. Find **Project API keys**
4. Copy the **anon/public** key (starts with `eyJ...`)
5. Save it somewhere safe

---

### Step 6: Add Environment Variables ✅

**Action:** Create/update `.env.local`

1. Create `.env.local` file in project root (if not exists)
2. Add:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://ftgrrlkjavcumjkyyyva.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=paste_your_anon_key_here

# Other variables...
ELEVENLABS_API_KEY=your_key_here
DID_API_KEY=your_key_here
```

3. Restart dev server: `npm run dev`

---

### Step 7: Deploy Backend (Optional - for FastAPI) ⚠️

**Action:** Only if you want separate FastAPI backend

**Current Setup:** We're using Next.js API routes (no separate FastAPI needed)

If you want FastAPI later:
1. Create FastAPI app
2. Deploy to Vercel/Railway/Render
3. Update API endpoints in code

**For now:** Next.js API routes handle everything ✅

---

## ✅ Verification Checklist

After completing all steps:

- [ ] Tables created: `memorials`, `heaven_characters`, `slideshow_media`, `orders`
- [ ] RLS enabled on all tables
- [ ] Policies created for all tables
- [ ] Storage bucket `heaven-assets` created
- [ ] Storage policies configured (SELECT, INSERT, UPDATE, DELETE)
- [ ] Supabase Anon Key copied
- [ ] `.env.local` file created with Supabase variables
- [ ] Dev server restarted

---

## 🧪 Test Connection

Run this in browser console to test:

```javascript
// Test Supabase connection
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://ftgrrlkjavcumjkyyyva.supabase.co',
  'YOUR_ANON_KEY'
);

// Test query
supabase.from('memorials').select('*').limit(1).then(console.log);
```

---

## 📝 Quick Reference

**Supabase Dashboard:** https://supabase.com/dashboard  
**Your Project URL:** https://ftgrrlkjavcumjkyyyva.supabase.co  
**SQL Editor:** Dashboard → SQL Editor  
**Storage:** Dashboard → Storage  
**API Keys:** Dashboard → Settings → API  

---

## 🚀 Next Steps After Setup

1. Test upload: Upload a video to `heaven-assets` bucket
2. Test database: Insert a test memorial record
3. Test HEAVEN: Create a character and verify storage
4. Monitor: Check Supabase logs for errors

---

## 📞 Need Help?

- **Supabase Docs:** https://supabase.com/docs
- **Storage Guide:** https://supabase.com/docs/guides/storage
- **RLS Guide:** https://supabase.com/docs/guides/auth/row-level-security

