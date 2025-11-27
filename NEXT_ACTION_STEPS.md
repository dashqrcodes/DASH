# Next Action Steps - Recommended Priority Order

## ✅ **COMPLETED TODAY**
1. ✅ Removed life chapters (13 files)
2. ✅ Removed HEAVEN streaming/complex features (14 files)
3. ✅ Renamed BottomNav → TopNav
4. ✅ Simplified /heaven.tsx (demo/fundraising page)
5. ✅ Protected Kobe video (0% chance of breaking)

---

## 🎯 **IMMEDIATE NEXT STEPS** (This Week)

### **Priority 1: Test & Verify** ⚡
**Goal:** Ensure Kobe video works for Mike Jones + everything works after cleanup

**Actions:**
1. **Test locally:**
   ```bash
   npm run dev
   ```
   - Visit `http://localhost:3000/heaven/kobe-bryant` → Should show Kobe video
   - Visit `http://localhost:3000/heaven` → Should show demo/fundraising page
   - Test TopNav navigation on all pages
   - Verify slideshow still works

2. **Deploy to Vercel:**
   ```bash
   git add .
   git commit -m "Cleanup: Remove life chapters, simplify HEAVEN, TopNav migration"
   git push origin main
   ```
   - Verify deployment succeeds
   - Test Kobe video on production: `https://dashmemories.com/heaven/kobe-bryant`
   - **CRITICAL:** Confirm video loads for Mike Jones's QR code

**Time:** 30 minutes
**Risk:** Low (we protected Kobe video)

---

### **Priority 2: Slideshow Backend Enhancement** 📸
**Goal:** Improve slideshow persistence (already partially implemented)

**Current State:**
- ✅ Supabase utilities exist (`getSlideshowMedia`, `storeSlideshowMedia`, `uploadSlideshowMedia`)
- ⚠️ Currently falls back to localStorage
- ⚠️ Needs user/memorial context to work properly

**Actions:**
1. **Review existing Supabase functions** in `src/utils/supabase.ts`:
   - Lines 289-393: `uploadSlideshowMedia`, `storeSlideshowMedia`, `getSlideshowMedia`
   - Verify they work with current table structure

2. **Check Supabase table** (`slideshow_media`):
   - Ensure table exists with columns: `id`, `user_id`, `memorial_id`, `url`, `type`, `mux_playback_id`, etc.
   - Verify RLS policies allow read/write

3. **Enhance slideshow.tsx** (lines 426-465):
   - Currently tries Supabase first, then localStorage
   - Add proper error handling
   - Add loading states
   - Connect to user session/auth

4. **Test:**
   - Upload photos → Should save to Supabase
   - Refresh page → Should load from Supabase
   - Test fallback to localStorage if Supabase fails

**Time:** 2-3 hours
**Risk:** Medium (touching persistence layer)

---

### **Priority 3: User Profile vs Memorial Profile Separation** 👤
**Goal:** Clear distinction between survivor profile and deceased memorial

**Current State:**
- ⚠️ Unclear separation
- User profile at `/account`
- Memorial profile at `/memorial/[name]`

**Actions:**
1. **Design clear distinction:**
   - User Profile (`/profile` or `/my-profile`): 
     - User's name, photo, email, phone
     - List of memorials they created
     - Settings/preferences
   
   - Memorial Profile (`/memorial/[name]`):
     - Deceased's name, dates (birth/death)
     - Photos/videos gallery
     - Comments section
     - Donations section
     - QR code for sharing

2. **Update navigation:**
   - TopNav "Profile" icon → Goes to user profile
   - User profile shows list → Click memorial → Goes to memorial profile

3. **Create user profile page** (if doesn't exist):
   - Fetch user data from `profiles` table
   - List memorials from `memorials` table where `user_id` matches
   - Clean, simple design

**Time:** 3-4 hours
**Risk:** Medium (navigation/UX changes)

---

## 📋 **SECONDARY TASKS** (Next Week)

### **Priority 4: HEAVEN Demo Page Polish** 🎨
- Update NetCapital URL when available
- Add analytics tracking
- Add social sharing buttons
- A/B test different copy

### **Priority 5: QR Code Generation** 📱
- Ensure QR codes work for memorial profiles
- Generate instantly on memorial creation
- Support for card/poster design integration

### **Priority 6: Error Handling & Logging** 🔍
- Add Sentry or similar error tracking
- Better user-facing error messages
- Logging for video playback issues

---

## 🚀 **DEPLOYMENT CHECKLIST**

Before deploying:
- [ ] Test Kobe video locally
- [ ] Test TopNav on all pages
- [ ] Test slideshow upload/load
- [ ] Run `npm run build` (check for errors)
- [ ] Check linter: `npm run lint`
- [ ] Verify environment variables set in Vercel

After deploying:
- [ ] Test Kobe video on production
- [ ] Test HEAVEN demo page
- [ ] Verify navigation works
- [ ] Check mobile responsiveness

---

## 💡 **EXPERT RECOMMENDATION**

**Start with Priority 1 (Test & Verify)** because:
1. ✅ **Low risk** - Just verifying what we built works
2. ✅ **High value** - Confirms Kobe video for Mike Jones
3. ✅ **Quick win** - 30 minutes, immediate confidence
4. ✅ **Foundation** - Must pass before building more

**Then Priority 2 (Slideshow Backend)** because:
1. ✅ **User requested** - "simple backend" for slideshow
2. ✅ **Partially done** - Just needs connection/verification
3. ✅ **Foundation** - Needed for production

**Priority 3 (User/Memorial separation)** can wait until after:
- User testing/feedback
- Core features are stable
- More users are using the app

---

## 🎯 **RECOMMENDED ACTION: START WITH PRIORITY 1**

**Next command to run:**
```bash
npm run dev
```

Then test:
1. `http://localhost:3000/heaven/kobe-bryant`
2. `http://localhost:3000/heaven`
3. Navigate through TopNav

**If everything works → Deploy immediately**

**If issues → Fix, then deploy**

---

## 📞 **SUPPORT**

If anything breaks:
1. Check console for errors
2. Check network tab for failed requests
3. Verify environment variables
4. Check Supabase connection
5. Rollback to previous commit if needed

