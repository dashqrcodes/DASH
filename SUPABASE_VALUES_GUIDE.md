# What Values to Put for Supabase Keys

## Quick Answer

You need to get these values **FROM YOUR SUPABASE PROJECT**, not from me. Here's where to find them:

## Step-by-Step: Get Your Values

### Step 1: Go to Supabase Dashboard

1. Visit: **https://app.supabase.com**
2. Sign in with your account
3. Select your project (or create a new one if you don't have one)

### Step 2: Find Your Project URL

1. In the left sidebar, click **"Settings"** (gear icon ⚙️ at the bottom)
2. Click **"API"** in the settings menu
3. Look for **"Project URL"**
   - It will look like: `https://xxxxxxxxxxxxx.supabase.co`
   - Example: `https://ftgrrlkjavcumjkyyyva.supabase.co`
   - **This is your `NEXT_PUBLIC_SUPABASE_URL` value**

### Step 3: Find Your Anon Key

1. Still in **Settings → API**
2. Scroll down to **"Project API keys"** section
3. Find the key labeled **"anon"** or **"public"**
   - Click the **eye icon** 👁️ to reveal it
   - Click the **copy icon** 📋 to copy it
   - It's a very long string starting with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY` value**

### Step 4: Add to Vercel

Go to Vercel and add these two environment variables:

**Variable 1:**
```
Key: NEXT_PUBLIC_SUPABASE_URL
Value: (paste the Project URL from Step 2)
Example: https://ftgrrlkjavcumjkyyyva.supabase.co
```

**Variable 2:**
```
Key: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: (paste the anon key from Step 3)
Example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0Z3JybGtqYXZjdW1qa3l5eXZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTk5OTk5OTksImV4cCI6MjAxNTU3NTk5OX0.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Visual Guide

```
Supabase Dashboard
└── Settings (⚙️ at bottom)
    └── API
        ├── Project URL
        │   └── Value: https://xxxxx.supabase.co  ← Copy this
        │
        └── Project API keys
            ├── anon public: [Hidden] 👁️  ← Click eye, then copy
            └── service_role: [Hidden]    ← DON'T use this one
```

## Important Notes

✅ **Use the "anon" or "public" key** - this is safe for client-side code
❌ **Do NOT use the "service_role" key** - that's for server-side only

## Don't Have a Supabase Project?

If you don't have a Supabase project yet:

1. Go to **https://supabase.com**
2. Click **"Start your project"** or **"New Project"**
3. Create a new project (it's free)
4. Wait for it to be ready (1-2 minutes)
5. Then follow the steps above to get your values

## Example Format

Your values should look like this:

**NEXT_PUBLIC_SUPABASE_URL:**
```
https://abcdefghijklmnop.supabase.co
```

**NEXT_PUBLIC_SUPABASE_ANON_KEY:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY5OTk5OTk5OSwiZXhwIjoyMDE1NTc1OTk5fQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Can't Find Your Values?

If you're having trouble:
1. Make sure you're logged into Supabase
2. Make sure you've selected the correct project
3. The API section is always in **Settings → API**
4. The anon key might be hidden - click the eye icon to reveal it

## After Adding to Vercel

1. Make sure you select **Production, Preview, and Development** environments
2. Click **Save**
3. **Redeploy** your Vercel project
4. Test: Visit `https://dashmemories.com/api/test-heaven-supabase`

