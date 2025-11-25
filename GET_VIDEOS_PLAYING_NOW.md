# 🎬 Get Videos Playing on Vercel - Complete Guide

## 🎯 Goal
Get videos playing successfully when visiting:
- `https://dashmemories.com/heaven/kobe-bryant`
- `https://dashmemories.com/heaven/kelly-wong`

---

## ✅ Step-by-Step Solution

### Step 1: Add Environment Variables to Vercel

**Go to Vercel:**
1. Open: **https://vercel.com/dashboard**
2. Click on your project
3. Click **Settings** tab (at the top)
4. Click **Environment Variables** (in left sidebar)

**Add Kobe Bryant Video:**
1. Click **"Add New"** button
2. **Key field** - Type this manually (character by character):
   ```
   NEXT_PUBLIC_KOBE_DEMO_VIDEO
   ```
   ⚠️ Important: Type manually, don't copy-paste. All uppercase, underscores only.

3. **Value field** - Type:
   ```
   https://www.dashqrcodes.com/heaven-kobe-bryant
   ```

4. **Check these boxes:**
   - ☑️ Production
   - ☑️ Preview
   - ☑️ Development

5. Click **"Save"**

**Add Kelly Wong Video (if needed):**
1. Click **"Add New"** button again
2. **Key field** - Type manually:
   ```
   NEXT_PUBLIC_KELLY_DEMO_VIDEO
   ```

3. **Value field** - Type:
   ```
   https://www.dashqrcodes.com/heaven-kelly-wong
   ```

4. **Check these boxes:**
   - ☑️ Production
   - ☑️ Preview
   - ☑️ Development

5. Click **"Save"**

---

### Step 2: Verify Variables Were Added

After saving, you should see in the list:
- ✅ `NEXT_PUBLIC_KOBE_DEMO_VIDEO` = `https://www.dashqrcodes.com/heaven-kobe-bryant`
- ✅ `NEXT_PUBLIC_KELLY_DEMO_VIDEO` = `https://www.dashqrcodes.com/heaven-kelly-wong`

If you see them, you're good! ✅

---

### Step 3: Redeploy (CRITICAL - Won't Work Without This!)

**This is the most important step!**

1. Click **"Deployments"** tab (at the top)
2. Find your **latest deployment** (usually at the top)
3. Click **"⋯"** (three dots) on the right side
4. Click **"Redeploy"**
5. Make sure **"Use existing Build Cache"** is checked (or leave defaults)
6. Click **"Redeploy"** button
7. **Wait 1-2 minutes** for deployment to complete

**Why this matters:** Environment variables only take effect after redeploy!

---

### Step 4: Test the Videos

**After redeployment completes:**

1. Visit: **https://dashmemories.com/heaven/kobe-bryant**
   - ✅ Should see video playing (not "No video available" message)

2. Visit: **https://dashmemories.com/heaven/kelly-wong**
   - ✅ Should see video playing (not "No video available" message)

---

## 🔍 Troubleshooting

### Problem: Still seeing "No video available"

**Check 1: Did you redeploy?**
- ❌ Adding variables isn't enough - must redeploy!
- ✅ Go to Deployments tab → Redeploy latest

**Check 2: Variable names correct?**
- Must be exactly: `NEXT_PUBLIC_KOBE_DEMO_VIDEO` (all caps, underscores)
- Must be exactly: `NEXT_PUBLIC_KELLY_DEMO_VIDEO` (all caps, underscores)

**Check 3: All environments checked?**
- ☑️ Production
- ☑️ Preview
- ☑️ Development
- All three must be checked!

**Check 4: Wait time**
- After redeploy, wait 1-2 minutes
- Changes take time to propagate

**Check 5: Hard refresh browser**
- Press `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
- Clears browser cache

---

### Problem: "Invalid characters" error when adding variable

**Solution:**
1. Type the key name manually (don't copy-paste)
2. Make sure it's all uppercase
3. Use underscores `_` not hyphens `-`
4. No spaces anywhere

**Correct format:**
```
NEXT_PUBLIC_KOBE_DEMO_VIDEO
```

---

### Problem: Video URL might be wrong

**Check if URLs are correct:**
- Test: `https://www.dashqrcodes.com/heaven-kobe-bryant` in browser
- Test: `https://www.dashqrcodes.com/heaven-kelly-wong` in browser

**If URLs don't work:**
- These need to be direct video file URLs (`.mp4`, `.m3u8`, etc.)
- Or URLs that serve video files directly

---

## 📋 Quick Checklist

- [ ] Opened Vercel Dashboard
- [ ] Went to Settings → Environment Variables
- [ ] Added `NEXT_PUBLIC_KOBE_DEMO_VIDEO` = `https://www.dashqrcodes.com/heaven-kobe-bryant`
- [ ] Added `NEXT_PUBLIC_KELLY_DEMO_VIDEO` = `https://www.dashqrcodes.com/heaven-kelly-wong`
- [ ] Checked Production, Preview, Development for both
- [ ] Clicked Save for both variables
- [ ] Both variables appear in the list
- [ ] Went to Deployments tab
- [ ] Clicked Redeploy on latest deployment
- [ ] Waited 1-2 minutes for deployment to complete
- [ ] Tested: `https://dashmemories.com/heaven/kobe-bryant` ✅
- [ ] Tested: `https://dashmemories.com/heaven/kelly-wong` ✅

---

## 🎯 Success Criteria

**You'll know it's working when:**
- ✅ Visiting `https://dashmemories.com/heaven/kobe-bryant` shows video playing
- ✅ Visiting `https://dashmemories.com/heaven/kelly-wong` shows video playing
- ✅ No "No video available" error message
- ✅ Videos are fullscreen and playing automatically

---

## 🆘 Still Not Working?

**Get more info:**
1. Open browser console (F12 or Cmd+Option+I)
2. Look for errors in the console
3. Check Network tab - see if video URL is being loaded
4. Look for any error messages

**Common errors to check:**
- Video URL not loading (404 error)
- CORS errors
- Video format not supported

---

## 💡 Next Steps After Videos Work

Once videos are playing:
1. ✅ Test on mobile device (QR code scan)
2. ✅ Test different browsers
3. ✅ Verify fullscreen works correctly
4. ✅ Check video quality and loading speed

