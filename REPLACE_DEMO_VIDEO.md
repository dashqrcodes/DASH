# How to Replace the Current HEAVEN Demo Video

## How It Currently Works

The demo videos come from **Vercel Environment Variables**:

- **Kobe Bryant:** `NEXT_PUBLIC_KOBE_DEMO_VIDEO`
- **Kelly Wong:** `NEXT_PUBLIC_KELLY_DEMO_VIDEO`

If these aren't set, it shows a placeholder video (BigBuckBunny).

---

## Replace the Video (2 Minutes)

### Step 1: Go to Vercel

1. Go to [Vercel Dashboard](https://vercel.com)
2. Select your **DASH** project
3. Go to **Settings** → **Environment Variables**

### Step 2: Edit the Environment Variable

**For Kobe Bryant:**
1. Find `NEXT_PUBLIC_KOBE_DEMO_VIDEO`
2. Click to **edit** (or create if it doesn't exist)
3. Set **Value** to your video URL:
   ```
   https://drive.google.com/uc?export=download&id=1mwXwubTJtD8yopRTzTm7MMoShV25JO62
   ```
4. Make sure **Production**, **Preview**, **Development** are checked
5. Click **Save**

**For Kelly Wong:**
1. Find `NEXT_PUBLIC_KELLY_DEMO_VIDEO`
2. Same steps as above

### Step 3: Redeploy

1. Go to **Deployments** tab
2. Click **"..."** on latest deployment
3. Click **"Redeploy"**
4. Wait 1-2 minutes

### Step 4: Test

Visit:
- `https://dashmemories.com/heaven/kobe-bryant`
- `https://dashmemories.com/heaven/kelly-wong`

Your video should now be playing!

---

## Your Video URL (Ready to Use)

**Direct Google Drive URL:**
```
https://drive.google.com/uc?export=download&id=1mwXwubTJtD8yopRTzTm7MMoShV25JO62
```

**Just paste this in the Vercel environment variable value field!**

---

## Which Demo?

**Tell me which one:**
- Kobe Bryant → Update `NEXT_PUBLIC_KOBE_DEMO_VIDEO`
- Kelly Wong → Update `NEXT_PUBLIC_KELLY_DEMO_VIDEO`
- Both → Update both!

---

## Quick Copy-Paste

**For Kobe Bryant:**
- **Key:** `NEXT_PUBLIC_KOBE_DEMO_VIDEO`
- **Value:** `https://drive.google.com/uc?export=download&id=1mwXwubTJtD8yopRTzTm7MMoShV25JO62`

**For Kelly Wong:**
- **Key:** `NEXT_PUBLIC_KELLY_DEMO_VIDEO`
- **Value:** `https://drive.google.com/uc?export=download&id=1mwXwubTJtD8yopRTzTm7MMoShV25JO62`

That's it! Just update the value in Vercel and redeploy.


