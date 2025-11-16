# How to Get Your Supabase Anon Key

## Step-by-Step Guide

### 1. Log in to Supabase
- Go to [https://app.supabase.com](https://app.supabase.com)
- Sign in with your account

### 2. Select Your Project
- If you have multiple projects, click on the project you want to use
- If you don't have a project yet, click **"New Project"** to create one

### 3. Navigate to API Settings
- In the left sidebar, click on **"Settings"** (gear icon at the bottom)
- Click on **"API"** in the settings menu

### 4. Find Your Keys
You'll see several sections:

#### **Project URL** (you already have this)
- This is your `NEXT_PUBLIC_SUPABASE_URL`
- Example: `https://ftgrrlkjavcumjkyyyva.supabase.co`
- ✅ You already have this in your code

#### **anon/public key** (this is what you need!)
- Look for the section labeled **"Project API keys"**
- Find the key labeled **"anon"** or **"public"**
- Click the **eye icon** 👁️ to reveal it (or click "Reveal")
- Click the **copy icon** 📋 to copy it

**Important:** This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 5. What Each Key Is For

- **anon/public key**: ✅ Use this one! Safe for client-side code
- **service_role key**: ❌ DO NOT use this in client-side code (it's for server-side only)

## Visual Guide

```
Supabase Dashboard
├── Settings (gear icon)
    └── API
        ├── Project URL: https://xxxxx.supabase.co
        └── Project API keys
            ├── anon public: eyJhbGc... ← COPY THIS ONE
            └── service_role: eyJhbGc... ← Don't use this
```

## Where to Add the Key

### For Local Development (.env.local)
Create or edit `.env.local` in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ftgrrlkjavcumjkyyyva.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (your actual key)
```

### For Production (Vercel)
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Click **"Add New"**
5. Add:
   - **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Value**: (paste your anon key)
   - **Environment**: Select "Production" (and Preview/Development if needed)
6. Click **"Save"**
7. **Redeploy** your project for changes to take effect

## Security Notes

✅ **Safe to use in client-side code:**
- The `anon` key is designed to be public
- It's restricted by Row Level Security (RLS) policies
- It's safe to expose in your frontend code

❌ **Never expose:**
- `service_role` key (has full database access)
- Database passwords
- Any other secret keys

## Troubleshooting

**"I don't see the API section"**
- Make sure you're logged in
- Make sure you've selected a project
- The API section is always in Settings → API

**"The key is hidden"**
- Click the eye icon 👁️ to reveal it
- Or click "Reveal" button

**"I copied the wrong key"**
- Make sure you copied the **"anon"** or **"public"** key
- NOT the "service_role" key

**"The key doesn't work"**
- Make sure you copied the entire key (they're very long)
- Check for any extra spaces before/after
- Make sure you're using `NEXT_PUBLIC_SUPABASE_ANON_KEY` (not just `SUPABASE_ANON_KEY`)

## Quick Checklist

- [ ] Logged into Supabase
- [ ] Selected correct project
- [ ] Went to Settings → API
- [ ] Found "anon" or "public" key
- [ ] Copied the key
- [ ] Added to `.env.local` (for local dev)
- [ ] Added to Vercel Environment Variables (for production)
- [ ] Redeployed (if production)

## Need Help?

If you can't find your key:
1. Make sure you're the project owner or have admin access
2. Check if you're in the correct project
3. Try refreshing the page
4. Contact Supabase support if you still can't access it

