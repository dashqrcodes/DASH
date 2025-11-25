# 🚨 Supabase Setup Required - Quick Steps

## Current Status
❌ **Supabase is NOT configured** on dashmemories.com

Test result: `https://dashmemories.com/api/test-heaven-supabase`
```json
{
  "success": false,
  "message": "❌ Supabase not configured",
  "details": {
    "url": "❌ Missing",
    "hasAnonKey": false
  }
}
```

## What You Need To Do

### Step 1: Get Your Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and sign in
2. Select your project (or create one if you don't have it)
3. Go to **Settings** → **API**
4. Copy these two values:

   **a) Project URL:**
   - Look for "Project URL" 
   - Example: `https://xxxxx.supabase.co`
   - This is your `NEXT_PUBLIC_SUPABASE_URL`

   **b) anon/public key:**
   - Look for "anon public" or "public" key
   - It starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Step 2: Add to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Find your project (should be `nextjs-auth-app` or `DASH`)
3. Click **Settings** → **Environment Variables**
4. Add these two variables:

   **Variable 1:**
   ```
   Name: NEXT_PUBLIC_SUPABASE_URL
   Value: https://your-project-id.supabase.co
   Environment: Production, Preview, Development (check all three)
   ```

   **Variable 2:**
   ```
   Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (paste your full key)
   Environment: Production, Preview, Development (check all three)
   ```

5. Click **Save** for each variable

### Step 3: Redeploy

After adding the environment variables, you MUST redeploy:

1. Go to **Deployments** tab in Vercel
2. Click the **"..."** menu on the latest deployment
3. Click **Redeploy**
4. Wait for the deployment to finish (2-3 minutes)

### Step 4: Verify

After redeployment completes:

1. Visit: `https://dashmemories.com/api/test-heaven-supabase`
2. You should see:
   ```json
   {
     "success": true,
     "message": "✅ Supabase Heaven connection working!",
     "details": {
       "url": "https://your-project.supabase.co",
       "operations": {
         "read": "✅ Working",
         "insert": "✅ Working",
         "delete": "✅ Working"
       }
     }
   }
   ```

### Step 5: Set Up the Database Table

After Supabase is connected, run this SQL in Supabase:

1. Go to Supabase Dashboard → **SQL Editor**
2. Open file: `HEAVEN_SIMPLIFIED_SUPABASE_SETUP.sql`
3. Copy and paste the entire script
4. Click **Run**

This creates the `heaven_characters` table needed for storing video URLs.

### Step 6: Add Video Records

After the table is created, run one of these SQL scripts:

**For Kelly Wong:**
- Open: `UPDATE_KELLY_WONG_VIDEO.sql`
- Replace `'YOUR_VIDEO_URL_HERE'` with the actual video URL
- Run in Supabase SQL Editor

**To copy Kelly Wong video to Kobe Bryant:**
- Open: `COPY_KELLY_VIDEO_TO_KOBE.sql`
- Run as-is (it will automatically copy the video URL)

## Quick Checklist

- [ ] Get Supabase Project URL and anon key
- [ ] Add `NEXT_PUBLIC_SUPABASE_URL` to Vercel
- [ ] Add `NEXT_PUBLIC_SUPABASE_ANON_KEY` to Vercel
- [ ] Redeploy Vercel project
- [ ] Test: `https://dashmemories.com/api/test-heaven-supabase` shows success
- [ ] Run `HEAVEN_SIMPLIFIED_SUPABASE_SETUP.sql` in Supabase
- [ ] Add video records using SQL scripts

## Need Help?

If you get stuck:
1. Check the test endpoint to see what's missing
2. Make sure environment variables are set for **Production** environment
3. Make sure you **redeployed** after adding variables
4. Check Vercel deployment logs for any errors

