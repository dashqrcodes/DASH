# How to Edit Existing Vercel Environment Variables

## The Keys Already Exist - Here's How to Update Them

### Step 1: Go to Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com)
2. Select your **DASH** project
3. Go to **Settings** → **Environment Variables**

### Step 2: Find the Existing Variables

Look for:
- `NEXT_PUBLIC_KOBE_DEMO_VIDEO`
- `NEXT_PUBLIC_KELLY_DEMO_VIDEO`

### Step 3: Edit the Value

1. **Click on the variable name** (or the edit/pencil icon)
2. **Update the "Value" field** with your new video URL
3. **Make sure the environments are checked:**
   - ☑ Production
   - ☑ Preview  
   - ☑ Development
4. **Click "Save"** or "Update"

### Alternative: Delete and Recreate

If you can't edit:

1. **Delete the existing variable:**
   - Click the **trash/delete icon** next to the variable
   - Confirm deletion

2. **Create new variable:**
   - Click **"Add New"**
   - Key: `NEXT_PUBLIC_KOBE_DEMO_VIDEO`
   - Value: [Your video URL]
   - Environments: ☑ Production ☑ Preview ☑ Development
   - Click **"Save"**

### Step 4: Redeploy

After updating:
1. Go to **Deployments** tab
2. Click **"..."** on latest deployment
3. Click **"Redeploy"**

---

## Quick Check

After redeploying, test:
- `https://dashmemories.com/heaven/kobe-bryant`
- `https://dashmemories.com/heaven/kelly-wong`

The videos should load with the new URLs!


