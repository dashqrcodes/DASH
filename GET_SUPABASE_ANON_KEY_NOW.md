# 🔑 Get Your Supabase Anon Key - Quick Guide

## 🎯 Where to Find It

**You need to get this from YOUR Supabase account** - I can't provide it because it's unique to your project.

---

## ✅ Step-by-Step: Get Your Anon Key

### Step 1: Go to Supabase

1. Visit: **https://app.supabase.com**
2. **Sign in** to your account

---

### Step 2: Select Your Project

1. **Select your project** from the list
   - Look for project with URL: `ftgrrlkjavcumjkyyyva.supabase.co` (from your docs)
   - Or select the project you created

---

### Step 3: Go to Settings → API

1. Click **Settings** (gear icon ⚙️ at bottom left)
2. Click **API** in the settings menu

---

### Step 4: Find Your Anon Key

1. Scroll to **"Project API keys"** section
2. Find the key labeled **"anon"** or **"public"**
3. Click the **eye icon** 👁️ to reveal it (it's hidden by default)
4. Click the **copy icon** 📋 to copy it

**This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`**

---

## 📝 What It Should Look Like

**The anon key will be a very long string** that looks like:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0Z3JybGtqYXZjdW1qa3l5eXZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTk5OTk5OTksImV4cCI6MjAxNTU3NTk5OX0.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Key characteristics:**
- ✅ Very long (usually 200+ characters)
- ✅ Starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- ✅ Has dots (`.`) separating sections
- ✅ This is a JWT token

---

## ⚠️ Important Notes

### Don't Use Service Role Key

**Make sure you copy the "anon" or "public" key:**
- ✅ **anon/public key** - Safe for client-side (use this one!)
- ❌ **service_role key** - Server-side only (DO NOT use this in frontend!)

### Full Key Must Be Copied

- ✅ Copy the ENTIRE key (it's very long)
- ❌ Don't cut it off or shorten it
- ✅ No spaces before or after

---

## 🎯 Quick Visual Guide

```
Supabase Dashboard
└── Settings (⚙️ gear icon)
    └── API
        ├── Project URL: https://xxxxx.supabase.co
        └── Project API keys
            ├── anon public: [Hidden] 👁️ ← CLICK EYE TO REVEAL
            │                    📋 ← THEN COPY THIS ONE
            └── service_role: [Hidden]  ← Don't use this
```

---

## ✅ After You Get It

### Add to Vercel:

1. Go to: `https://vercel.com/david-gastelums-projects/nextjs-auth-app/settings/environment-variables`
2. Click **"Add New"**
3. **Key:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. **Value:** (paste the long key you copied)
5. **Environment:** ☑️ Production only
6. Click **Save**

### Don't Forget:

- ✅ Also add `NEXT_PUBLIC_SUPABASE_URL` = `https://ftgrrlkjavcumjkyyyva.supabase.co`
- ✅ Redeploy after adding variables!

---

## 🆘 Can't Find It?

**If you can't find your anon key:**

1. **Check you're logged in** to Supabase
2. **Check you selected the right project**
3. **Make sure you're in Settings → API** (not another section)
4. **Click the eye icon** - the key is hidden by default
5. **If still can't find it:**
   - You might need to create a Supabase project first
   - Or contact Supabase support

---

## 🎯 Quick Checklist

- [ ] Logged into Supabase
- [ ] Selected correct project
- [ ] Went to Settings → API
- [ ] Found "anon" or "public" key
- [ ] Clicked eye icon to reveal it
- [ ] Copied the ENTIRE key
- [ ] Ready to paste into Vercel

---

## 💡 Remember

**This value is:**
- ✅ Unique to YOUR Supabase project
- ✅ Available in YOUR Supabase dashboard
- ✅ Safe to use in client-side code
- ✅ Required for Supabase to work

**You need to get it from your own Supabase account!** 🔑

