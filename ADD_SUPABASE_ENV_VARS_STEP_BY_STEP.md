# ✅ Add Supabase Environment Variables to Vercel - Step by Step

## 🎯 Goal
Add these two environment variables to your Vercel project:
1. `NEXT_PUBLIC_SUPABASE_URL`
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 📋 Step 1: Open Vercel Dashboard

1. Go to: **https://vercel.com/dashboard**
2. Sign in if you're not already signed in

---

## 📋 Step 2: Find Your Project

1. Look for your project in the list
   - Project name might be: `nextjs-auth-app` or `DASH` or similar
2. **Click on the project name** to open it

**Can't find your project?**
- Check if you're in the right team/account (top left corner)
- Try searching for "nextjs-auth-app" in the search bar

---

## 📋 Step 3: Go to Settings

1. At the **top of the project page**, you'll see tabs like:
   - `Overview` | `Deployments` | `Settings` | `Analytics`
2. Click on **`Settings`** tab
3. In the **left sidebar**, you'll see:
   - General
   - Environment Variables ← **CLICK THIS**
   - Integrations
   - Git
   - etc.

---

## 📋 Step 4: Add First Variable (NEXT_PUBLIC_SUPABASE_URL)

1. Click the **`Environment Variables`** link in the left sidebar
2. You'll see a page with:
   - A list of existing variables (or empty if none)
   - A button that says **"Add New"** or **"New"** (usually top right)
3. Click **"Add New"** button
4. A modal/form will appear. Fill it in:

   **Key field:**
   ```
   NEXT_PUBLIC_SUPABASE_URL
   ```

   **Value field:**
   ```
   https://ftgrrlkjavcumjkyyyva.supabase.co
   ```

   **Environment checkboxes:**
   - ☑️ **Production**
   - ☑️ **Preview**
   - ☑️ **Development**
   
   *(Make sure all three are checked!)*

5. Click **"Save"** button (usually at the bottom right of the modal)

---

## 📋 Step 5: Add Second Variable (NEXT_PUBLIC_SUPABASE_ANON_KEY)

**First, get your anon key from Supabase:**

1. Open a new browser tab
2. Go to: **https://app.supabase.com**
3. Sign in
4. Select your project (the one with URL `ftgrrlkjavcumjkyyyva.supabase.co`)
5. Click **Settings** (gear icon at bottom left)
6. Click **API** in the settings menu
7. Scroll to **"Project API keys"** section
8. Find the **"anon"** or **"public"** key
9. Click the **eye icon** 👁️ to reveal it
10. Click the **copy icon** 📋 to copy the entire key
   - It will be a very long string starting with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

**Now add it to Vercel:**

11. Go back to Vercel tab (with Environment Variables page open)
12. Click **"Add New"** button again
13. Fill in the form:

    **Key field:**
    ```
    NEXT_PUBLIC_SUPABASE_ANON_KEY
    ```

    **Value field:**
    ```
    [Paste the long key you copied from Supabase]
    ```
    *(It should start with eyJhbG...)*

    **Environment checkboxes:**
    - ☑️ **Production**
    - ☑️ **Preview**
    - ☑️ **Development**
    
    *(Make sure all three are checked!)*

14. Click **"Save"** button

---

## 📋 Step 6: Verify Variables Were Added

After saving both variables, you should see them in the list:

```
Key                              Environments              Actions
─────────────────────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL         Production, Preview, ...   [Edit] [Delete]
NEXT_PUBLIC_SUPABASE_ANON_KEY    Production, Preview, ...   [Edit] [Delete]
```

**If you see them in the list, you're done! ✅**

---

## 📋 Step 7: Redeploy Your Project

**This is IMPORTANT - the variables won't work until you redeploy!**

1. Click the **"Deployments"** tab (at the top)
2. Find your **latest deployment** (usually at the top of the list)
3. Click the **"⋯"** (three dots) menu on the right side of that deployment
4. Click **"Redeploy"**
5. Make sure it says **"Use existing Build Cache"** is checked (or don't change anything)
6. Click **"Redeploy"** button
7. Wait for deployment to complete (usually 1-2 minutes)

---

## ✅ Step 8: Test It's Working

After redeployment completes:

1. Visit: **https://dashmemories.com/api/test-heaven-supabase**
2. You should see:
   ```json
   {
     "success": true,
     "message": "✅ Supabase Heaven connection working!",
     ...
   }
   ```

**If you see `"success": true`, it's working! 🎉**

---

## 🚨 Troubleshooting

### Problem: "Add New" button is not there
**Solution:**
- Make sure you're in the **Settings** tab
- Make sure you clicked **Environment Variables** in the left sidebar
- Try refreshing the page

### Problem: Can't find Environment Variables link
**Solution:**
- Look in the left sidebar under Settings
- It might be under a dropdown menu
- Try scrolling down in the sidebar

### Problem: "Save" button is grayed out or doesn't work
**Solution:**
- Make sure you filled in both Key and Value fields
- Make sure at least one environment checkbox is checked
- Try refreshing the page and starting over

### Problem: Variables show in list but test still fails
**Solution:**
- Did you redeploy? Variables only take effect after redeployment
- Check that all three environments (Production, Preview, Development) are checked
- Wait a few minutes after redeployment for changes to propagate

### Problem: Can't find Supabase anon key
**Solution:**
- Make sure you're logged into Supabase
- Make sure you selected the correct project
- The anon key is in **Settings → API → Project API keys → anon**
- Click the eye icon to reveal it if it's hidden

### Problem: "Variable already exists" error
**Solution:**
- Check if the variable already exists in the list
- If it does, click **"Edit"** instead of "Add New"
- Or delete the old one first, then add a new one

---

## 📸 Visual Guide

### What the Environment Variables page looks like:

```
┌──────────────────────────────────────────────────────────────┐
│  Settings                                                    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  [Environment Variables]              [+ Add New]            │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Key                  Environments    Actions           │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │ (empty or existing variables)                          │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### What the "Add New" modal looks like:

```
┌─────────────────────────────────────────────┐
│  Add Environment Variable                   │
├─────────────────────────────────────────────┤
│                                             │
│  Key:                                       │
│  [NEXT_PUBLIC_SUPABASE_URL____________]     │
│                                             │
│  Value:                                     │
│  [https://ftgrrlkjavcumjkyyyva.supabase.co] │
│                                             │
│  Environment:                               │
│  ☑️ Production                              │
│  ☑️ Preview                                 │
│  ☑️ Development                             │
│                                             │
│              [Cancel]  [Save]               │
└─────────────────────────────────────────────┘
```

---

## 🎯 Quick Checklist

- [ ] Opened Vercel Dashboard
- [ ] Found my project
- [ ] Went to Settings → Environment Variables
- [ ] Added `NEXT_PUBLIC_SUPABASE_URL` = `https://ftgrrlkjavcumjkyyyva.supabase.co`
- [ ] Got anon key from Supabase Dashboard → Settings → API
- [ ] Added `NEXT_PUBLIC_SUPABASE_ANON_KEY` = [my anon key]
- [ ] Selected all three environments (Production, Preview, Development) for both
- [ ] Clicked Save for both variables
- [ ] Both variables appear in the list
- [ ] Redeployed my project
- [ ] Tested at `https://dashmemories.com/api/test-heaven-supabase`
- [ ] Got `"success": true` response ✅

---

## 🆘 Still Stuck?

If you're still having trouble:

1. **Take a screenshot** of what you see on the Vercel Environment Variables page
2. **Describe what happens** when you click "Add New"
3. **What error message** (if any) do you see?

This will help diagnose the issue!

