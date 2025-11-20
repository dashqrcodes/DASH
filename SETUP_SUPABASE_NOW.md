# 🚀 Quick Setup: Supabase for DASH (Do This Now)

## Step 1: Run the SQL Script (5 minutes)

1. **Go to Supabase Dashboard**
   - Visit [supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your project

2. **Open SQL Editor**
   - Click **"SQL Editor"** in the left sidebar
   - Click **"New query"**

3. **Copy & Paste**
   - Open `DASH_COMPLETE_SUPABASE_SETUP.sql` from this repo
   - Copy **ALL** the SQL code
   - Paste into the SQL Editor
   - Click **"Run"** (or press `Ctrl+Enter` / `Cmd+Enter`)

4. **Verify Success**
   - You should see: "Success. No rows returned"
   - Go to **Table Editor** → You should see all tables created

---

## Step 2: Create Storage Buckets (2 minutes)

1. **Go to Storage**
   - Click **"Storage"** in the left sidebar
   - Click **"New bucket"**

2. **Create `heaven-assets` Bucket**
   - **Name:** `heaven-assets`
   - **Public bucket:** ✅ **CHECK THIS**
   - Click **"Create bucket"**

3. **Create `memorials` Bucket** (Optional)
   - **Name:** `memorials`
   - **Public bucket:** ✅ **CHECK THIS**
   - Click **"Create bucket"**

---

## Step 3: Set Storage Policies (2 minutes)

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
   - **Policy definition:** `true`
   - Click **"Save"**

---

## Step 4: Get Your Credentials (1 minute)

1. **Go to Settings → API**
   - Copy your **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - Copy your **anon/public key** (starts with `eyJ...`)

---

## Step 5: Add to Vercel (2 minutes)

1. **Go to Vercel Dashboard**
   - Select your DASH project
   - Go to **Settings** → **Environment Variables**

2. **Add These Variables:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

3. **Select Environments:**
   - ✅ Production
   - ✅ Preview
   - ✅ Development

4. **Click "Save"**

5. **Redeploy**
   - Go to **Deployments**
   - Click **"..."** on latest deployment → **"Redeploy"**

---

## Step 6: Test (1 minute)

1. **Check Browser Console**
   - Visit your site
   - Open DevTools (F12)
   - Should see: `✅ Supabase connected` (or no errors)

2. **Test Upload**
   - Go to slideshow page
   - Upload a photo
   - Check Supabase Storage → `heaven-assets` bucket
   - Photo should appear there

---

## ✅ Done!

Your Supabase is now set up for the entire DASH webapp!

**What's Set Up:**
- ✅ All database tables (memorials, slideshow_media, heaven_characters, orders, payments, etc.)
- ✅ Storage buckets (heaven-assets, memorials)
- ✅ Security policies (RLS, storage policies)
- ✅ Indexes for performance
- ✅ Triggers for auto-updates

**Next Steps:**
- Upload demo videos (see `SUPABASE_DEMO_VIDEO_SETUP.md`)
- Test all features
- Monitor Supabase dashboard for usage

---

## 🆘 Troubleshooting

**"Table already exists"**
- ✅ That's fine! The script uses `IF NOT EXISTS`
- ✅ Just continue

**"Permission denied"**
- ✅ Check RLS policies were created
- ✅ Verify storage bucket is public

**"Bucket not found"**
- ✅ Make sure you created `heaven-assets` bucket
- ✅ Verify it's marked as **Public**

**Need Help?**
- Check `COMPLETE_SUPABASE_SETUP.md` for detailed guide
- Check Supabase dashboard for error messages

