# Step-by-Step Guide: Add Environment Variables to Vercel

## Method 1: Via Vercel Dashboard (Easiest)

### Step 1: Open Vercel Dashboard
1. Go to: https://vercel.com/dashboard
2. Login if needed (you should already be logged in as `david-9458`)

### Step 2: Find Your Project
1. Look for the project: **`nextjs-auth-app`**
2. Click on the project name to open it

### Step 3: Go to Settings
1. At the top of the project page, click the **"Settings"** tab
2. In the left sidebar, click **"Environment Variables"**

### Step 4: Add CONVAI_API_KEY
1. Click the **"Add New"** button (usually at the top right)
2. Fill in the form:
   - **Key**: `CONVAI_API_KEY`
   - **Value**: `0a9faf3d6122d1c4d3a06a5df6cf73ca`
   - **Environment**: Check all three boxes:
     - ☑️ Production
     - ☑️ Preview
     - ☑️ Development
3. Click **"Save"**

### Step 5: Add Other Important Variables (Optional but Recommended)
Repeat Step 4 for these variables:

**PRINT_SHOP_EMAIL:**
- Key: `PRINT_SHOP_EMAIL`
- Value: `elartededavid@gmail.com`
- Environment: Production, Preview, Development

**NEXT_PUBLIC_BASE_URL** (Optional - for production domain):
- Key: `NEXT_PUBLIC_BASE_URL`
- Value: `https://your-production-domain.com` (replace with your actual domain)
- Environment: Production only

### Step 6: Redeploy
1. Go to the **"Deployments"** tab (at the top)
2. Find your latest deployment
3. Click the **"⋯"** (three dots) menu on the right
4. Click **"Redeploy"**
5. Confirm the redeploy

**OR** use the command line:
```bash
vercel --prod
```

---

## Method 2: Via Direct Link (Fastest)

1. Click this direct link: https://vercel.com/david-gastelums-projects/nextjs-auth-app/settings/environment-variables

2. Click **"Add New"**

3. Enter:
   - Key: `CONVAI_API_KEY`
   - Value: `0a9faf3d6122d1c4d3a06a5df6cf73ca`
   - Select all environments: Production, Preview, Development

4. Click **"Save"**

5. Go to Deployments tab: https://vercel.com/david-gastelums-projects/nextjs-auth-app/deployments

6. Click **"Redeploy"** on the latest deployment

---

## Method 3: Via Vercel CLI (Command Line)

Run these commands in your terminal:

```bash
# Make sure you're in the project directory
cd "/Users/davidgastelum/DASH Repository Web App/nextjs-auth-app"

# Add the environment variable
vercel env add CONVAI_API_KEY production preview development

# When prompted, paste: 0a9faf3d6122d1c4d3a06a5df6cf73ca

# Add other variables if needed
vercel env add PRINT_SHOP_EMAIL production preview development
# When prompted, paste: elartededavid@gmail.com

# Redeploy to production
vercel --prod
```

---

## Visual Guide (What You'll See)

### After clicking "Add New", you'll see:

```
┌─────────────────────────────────────────┐
│ Add Environment Variable                │
├─────────────────────────────────────────┤
│ Key:                                    │
│ [CONVAI_API_KEY________________]        │
│                                         │
│ Value:                                  │
│ [0a9faf3d6122d1c4d3a06a5df6cf73ca___]  │
│                                         │
│ Environment:                            │
│ ☑️ Production                           │
│ ☑️ Preview                              │
│ ☑️ Development                          │
│                                         │
│         [Cancel]  [Save]                 │
└─────────────────────────────────────────┘
```

---

## Verify It's Working

After redeploying:

1. Wait for deployment to complete (check the "Deployments" tab)
2. Visit your app: https://nextjs-auth-ja9wx6t0o-david-gastelums-projects.vercel.app
3. Go to `/heaven` page
4. Try the "Call to HEAVEN" feature
5. If it works, environment variables are set correctly!

---

## Troubleshooting

**"Variable not found" error:**
- Make sure you selected all environments (Production, Preview, Development)
- Wait a few minutes after saving
- Redeploy after adding variables

**"Failed to start HEAVEN call" error:**
- Double-check the API key value is exactly: `0a9faf3d6122d1c4d3a06a5df6cf73ca`
- Make sure there are no extra spaces
- Verify the key is active in Convai dashboard

**Can't find the Settings tab:**
- Make sure you're on the project page (not dashboard)
- Click on the project name first
- Settings tab is at the top, next to "Deployments"

---

## Quick Checklist

- [ ] Logged into Vercel dashboard
- [ ] Found project: `nextjs-auth-app`
- [ ] Went to Settings → Environment Variables
- [ ] Added `CONVAI_API_KEY` with value `0a9faf3d6122d1c4d3a06a5df6cf73ca`
- [ ] Selected all environments (Production, Preview, Development)
- [ ] Clicked Save
- [ ] Redeployed the project
- [ ] Tested the `/heaven` page

---

## Need Help?

If you get stuck:
1. Check Vercel dashboard: https://vercel.com/dashboard
2. View deployment logs: Click on deployment → "Build Logs"
3. Check browser console for errors

