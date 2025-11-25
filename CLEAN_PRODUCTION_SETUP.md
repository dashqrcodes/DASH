# 🎯 Clean Production Environment - Complete Setup Guide

## 🎯 Goal
Set up a single, clean production environment for your videos to work on `https://dashmemories.com`

---

## ✅ Step 1: Clean Up Environment Variables

### Go to Vercel Environment Variables:
**URL:** `https://vercel.com/david-gastelums-projects/nextjs-auth-app/settings/environment-variables`

### Check What You Have:
1. Look at your current environment variables
2. **Delete any old/unused ones** (clean up)
3. **Keep only what you need**

### Add/Update These Two Variables:

**Variable 1: Kobe Bryant Video**
- **Key:** `NEXT_PUBLIC_KOBE_DEMO_VIDEO`
- **Value:** `https://www.dashqrcodes.com/heaven-kobe-bryant`
- **Environments:** ☑️ **Production only** (uncheck Preview and Development)
- Click **Save**

**Variable 2: Kelly Wong Video**
- **Key:** `NEXT_PUBLIC_KELLY_DEMO_VIDEO`
- **Value:** `https://www.dashqrcodes.com/heaven-kelly-wong`
- **Environments:** ☑️ **Production only** (uncheck Preview and Development)
- Click **Save**

### Verify Your List:
You should now have:
- ✅ `NEXT_PUBLIC_KOBE_DEMO_VIDEO` → Production only
- ✅ `NEXT_PUBLIC_KELLY_DEMO_VIDEO` → Production only
- ✅ Any other variables you actually need

**Delete anything else that's not needed!**

---

## ✅ Step 2: Clean Up Deployments

### Go to Deployments:
**URL:** `https://vercel.com/david-gastelums-projects/nextjs-auth-app/deployments`

### What to Do:
1. **Find your latest deployment** (should be from "main" branch)
2. **Redeploy it** to pick up the new environment variables:
   - Click **"⋯"** (three dots) on the latest deployment
   - Click **"Redeploy"**
   - Wait 1-2 minutes for it to complete

### Optional Cleanup:
- You can delete old failed deployments (optional)
- Keep recent successful ones
- Don't delete the latest one!

---

## ✅ Step 3: Verify Production Setup

### Check Your Production Site:

**Test Kobe Bryant:**
- Visit: `https://dashmemories.com/heaven/kobe-bryant`
- ✅ Should see video playing
- ❌ If you see "No video available" → environment variables not set correctly

**Test Kelly Wong:**
- Visit: `https://dashmemories.com/heaven/kelly-wong`
- ✅ Should see video playing
- ❌ If you see "No video available" → environment variables not set correctly

---

## ✅ Step 4: Clean Up Project Settings

### Go to Project Settings:
**URL:** `https://vercel.com/david-gastelums-projects/nextjs-auth-app/settings`

### Check These:

**General:**
- ✅ Project name is correct
- ✅ Framework preset is correct (Next.js)

**Domains:**
- ✅ `dashmemories.com` is connected
- ✅ Remove any unused domains

**Git:**
- ✅ Connected to correct repository
- ✅ Production branch is "main"

**Environment Variables:**
- ✅ Only Production checked (as we set above)
- ✅ No duplicate variables

---

## 📋 Complete Checklist

### Environment Variables:
- [ ] Deleted any old/unused variables
- [ ] Added `NEXT_PUBLIC_KOBE_DEMO_VIDEO` = `https://www.dashqrcodes.com/heaven-kobe-bryant`
- [ ] Added `NEXT_PUBLIC_KELLY_DEMO_VIDEO` = `https://www.dashqrcodes.com/heaven-kelly-wong`
- [ ] Both set to **Production only**
- [ ] Saved both variables
- [ ] Verified they appear in the list

### Deployment:
- [ ] Found latest deployment
- [ ] Redeployed to pick up new variables
- [ ] Deployment completed successfully
- [ ] Status shows "Ready"

### Testing:
- [ ] Tested: `https://dashmemories.com/heaven/kobe-bryant` ✅
- [ ] Tested: `https://dashmemories.com/heaven/kelly-wong` ✅
- [ ] Videos are playing correctly
- [ ] No "No video available" errors

### Cleanup:
- [ ] Removed any unused environment variables
- [ ] Removed any unused domains
- [ ] Project is clean and organized

---

## 🎯 Your Clean Production Environment

### What You Should Have:

**One Project:**
- ✅ `nextjs-auth-app` (your main project)

**Two Environment Variables:**
- ✅ `NEXT_PUBLIC_KOBE_DEMO_VIDEO` (Production only)
- ✅ `NEXT_PUBLIC_KELLY_DEMO_VIDEO` (Production only)

**One Domain:**
- ✅ `dashmemories.com` (connected to production)

**One Branch:**
- ✅ `main` (your production branch)

**That's it! Clean and simple.** ✅

---

## 🚀 Quick Reference

### Important URLs:

**Vercel Dashboard:**
- Main: `https://vercel.com/dashboard`
- Project: `https://vercel.com/david-gastelums-projects/nextjs-auth-app`
- Environment Variables: `https://vercel.com/david-gastelums-projects/nextjs-auth-app/settings/environment-variables`
- Deployments: `https://vercel.com/david-gastelums-projects/nextjs-auth-app/deployments`

**Your Production Site:**
- Kobe: `https://dashmemories.com/heaven/kobe-bryant`
- Kelly: `https://dashmemories.com/heaven/kelly-wong`

---

## 🆘 Troubleshooting

### Videos Not Playing?

**Check 1: Environment Variables**
- Are they set to Production?
- Are the values correct?
- Did you redeploy after setting them?

**Check 2: Deployment**
- Did deployment complete successfully?
- Is status "Ready"?
- Check deployment logs for errors

**Check 3: Browser**
- Hard refresh (Cmd+Shift+R)
- Clear browser cache
- Check browser console (F12) for errors

---

## ✅ Success Criteria

**You'll know it's working when:**
- ✅ Visiting production URLs shows videos playing
- ✅ No "No video available" errors
- ✅ Environment variables are Production only
- ✅ Everything is clean and organized
- ✅ Only one project to manage

---

## 🎊 You're Done!

**Your production environment is now:**
- ✅ Clean
- ✅ Simple
- ✅ Focused
- ✅ Working

**One project, one environment, videos working!** 🎉

---

## 📝 Maintenance

### When You Need to Update Videos:

1. Go to Environment Variables
2. Edit the variable value
3. Redeploy
4. Test on production

**That's it! Simple and clean.** ✅

