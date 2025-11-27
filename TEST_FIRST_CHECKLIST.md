# Test First - Before Building New UX

## 🎯 **YES - Test First!**

**Reasoning:**
1. ✅ We just did major cleanup (27+ files deleted)
2. ✅ Kobe video is critical (Mike Jones viewing with QR code)
3. ✅ Navigation changed (BottomNav → TopNav)
4. ✅ HEAVEN page completely rewritten

**Better to:**
- Verify everything works first
- Fix any issues from cleanup
- Then build new features with confidence

---

## Testing Checklist ✅

### 1. **Critical: Kobe Video** 🔴
**URL:** `/heaven/kobe-bryant`
**What to Test:**
- [ ] Video loads (should use Mux iframe)
- [ ] Video plays automatically
- [ ] Video loops
- [ ] Back button works
- [ ] Works on mobile
- [ ] Works on desktop
- [ ] QR code link works (if you have the QR code)

**Status:** ⚠️ **MUST WORK** - Mike Jones viewing it!

---

### 2. **HEAVEN Demo Page** 🔴
**URL:** `/heaven`
**What to Test:**
- [ ] Page loads without errors
- [ ] Demo video shows (if embedded)
- [ ] NetCapital link works (or placeholder)
- [ ] About section displays
- [ ] Back button works
- [ ] TopNav displays correctly

---

### 3. **Top Navigation** 🔴
**What to Test:**
- [ ] TopNav appears on all pages:
  - [ ] `/heaven` page
  - [ ] `/heaven/kobe-bryant` page
  - [ ] `/slideshow` page
  - [ ] `/account` page
  - [ ] Any other pages
- [ ] Icons display correctly
- [ ] Clicking icons navigates correctly
- [ ] Works on mobile (not hidden by browser bar)
- [ ] Active tab highlights correctly

---

### 4. **Existing Pages** 🟡
**What to Test:**

**Slideshow (`/slideshow`):**
- [ ] Page loads
- [ ] Photo upload works
- [ ] Slideshow plays
- [ ] TopNav works

**Account (`/account`):**
- [ ] Page loads
- [ ] "Create New Dash" button works (if exists)
- [ ] Memorial list displays
- [ ] TopNav works

**Sign Up (`/sign-up`):**
- [ ] Page loads
- [ ] Form works
- [ ] OTP flow works (if implemented)

**Sign In (`/sign-in`):**
- [ ] Page loads
- [ ] Form works

---

### 5. **Build Errors** 🔴
**What to Test:**
- [ ] Run `npm run build` - should succeed
- [ ] No TypeScript errors
- [ ] No missing imports
- [ ] No broken references

---

### 6. **Local Development** 🟡
**What to Test:**
- [ ] Run `npm run dev` - starts without errors
- [ ] No console errors on load
- [ ] Pages render correctly

---

## How to Test 🧪

### Step 1: Local Testing
```bash
# Start dev server
npm run dev

# Test these URLs in browser:
# http://localhost:3000/heaven/kobe-bryant  ← CRITICAL
# http://localhost:3000/heaven
# http://localhost:3000/account
# http://localhost:3000/slideshow
```

### Step 2: Build Test
```bash
# Check for build errors
npm run build
```

### Step 3: Production Test (Optional)
```bash
# Deploy and test
git add .
git commit -m "Test: Verify after cleanup"
git push origin main

# Then test on production:
# https://dashmemories.com/heaven/kobe-bryant  ← CRITICAL
```

---

## If Issues Found 🐛

### Issue: Kobe Video Not Working
**Priority:** 🔴 **CRITICAL - Fix immediately**
**Action:**
1. Check console for errors
2. Verify Mux playback ID is correct
3. Check iframe embed syntax
4. Test on different browsers

### Issue: TopNav Not Showing
**Priority:** 🟡 **High - Navigation broken**
**Action:**
1. Check if TopNav component exists
2. Verify imports in pages
3. Check z-index (might be hidden)

### Issue: Build Errors
**Priority:** 🔴 **Critical - Can't deploy**
**Action:**
1. Fix TypeScript errors
2. Fix missing imports
3. Check for deleted file references

---

## Testing Time Estimate ⏱️

- **Local Testing:** 30 minutes
- **Build Test:** 5 minutes
- **Fix Issues:** 0-2 hours (hopefully none!)
- **Production Test:** 30 minutes

**Total: 1-3 hours**

---

## After Testing ✅

### If Everything Works:
✅ **Proceed with UX building:**
1. Update `/account` page with "Create a DASH" button
2. Build create memorial flow
3. Build memorial design page
4. Build public memorial page

### If Issues Found:
⚠️ **Fix first, then build:**
1. Fix Kobe video (if broken)
2. Fix TopNav (if broken)
3. Fix build errors
4. Then proceed with UX

---

## Recommendation 💡

**Test in this order:**

1. **Test Kobe video FIRST** (most critical)
2. **Test TopNav** (affects all pages)
3. **Test other pages** (slideshow, account, etc.)
4. **Test build** (can't deploy if broken)
5. **Fix any issues**
6. **Then build UX**

**This ensures:**
- ✅ Nothing broke from cleanup
- ✅ Critical features work
- ✅ Solid foundation for new features
- ✅ Can deploy safely

---

## Quick Test Command 🚀

```bash
# Run this to test everything at once:
npm run dev
# Then manually test the URLs above
```

**Or:**

```bash
# Check for build errors:
npm run build

# If successful, you're good to go!
```

