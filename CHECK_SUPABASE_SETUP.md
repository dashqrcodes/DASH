# Check if Supabase is Set Up

## Quick Test

Visit this URL on your production site:
- `https://dashmemories.com/api/test-heaven-supabase`
- Or: `https://www.dashqrcodes.com/api/test-heaven-supabase`

## What to Look For

### ✅ If Supabase is Set Up:
```json
{
  "success": true,
  "message": "✅ Supabase Heaven connection working!",
  "details": {
    "url": "https://your-project.supabase.co",
    "table": "heaven_characters",
    "operations": {
      "read": "✅ Working",
      "insert": "✅ Working",
      "delete": "✅ Working"
    }
  }
}
```

### ❌ If Supabase is NOT Set Up:
```json
{
  "success": false,
  "message": "❌ Supabase not configured",
  "details": {
    "url": "❌ Missing",
    "hasAnonKey": false,
    "error": "Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to Vercel environment variables"
  }
}
```

## How to Set Up Supabase

### Step 1: Get Your Supabase Credentials

1. Go to [supabase.com](https://supabase.com)
2. Sign in to your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → This is your `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Step 2: Add to Vercel

1. Go to your Vercel project dashboard
2. Go to **Settings** → **Environment Variables**
3. Add these two variables:

   **Variable 1:**
   - **Key:** `NEXT_PUBLIC_SUPABASE_URL`
   - **Value:** `https://your-project.supabase.co`
   - **Environment:** Production, Preview, Development (select all)

   **Variable 2:**
   - **Key:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (your actual key)
   - **Environment:** Production, Preview, Development (select all)

### Step 3: Redeploy

After adding the environment variables:
1. Go to **Deployments** tab
2. Click **Redeploy** on the latest deployment
3. Or push a new commit to trigger a new deployment

### Step 4: Verify

Visit the test endpoint again:
- `https://dashmemories.com/api/test-heaven-supabase`

You should now see `"success": true` if everything is working!

## Run the SQL Setup

After Supabase is connected, run these SQL scripts in Supabase SQL Editor:

1. **`HEAVEN_SIMPLIFIED_SUPABASE_SETUP.sql`** - Creates/updates the `heaven_characters` table
2. **`UPDATE_KELLY_WONG_VIDEO.sql`** - Sets up Kelly Wong video
3. **`COPY_KELLY_VIDEO_TO_KOBE.sql`** - Copies Kelly Wong video to Kobe Bryant

## Current Status

The code is ready for Supabase - it just needs the environment variables configured in Vercel!

