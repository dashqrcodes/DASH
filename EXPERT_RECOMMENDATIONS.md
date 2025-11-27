# Expert Recommendations: MIT/SF Top AI Web/Mobile App Builders

## Core Principles from Top Engineers

### 1. **Start Simple, Add Complexity Later** (YAGNI Principle)
**"You Aren't Gonna Need It"**

**Recommendation:**
- ✅ Build only what you need RIGHT NOW
- ❌ Don't build features you might need later
- ✅ Remove unused code immediately (don't let it accumulate)

**For Your Case:**
- Remove life chapters NOW (not using it)
- Simplify slideshow to core functionality
- Don't build complex features until users demand them

---

### 2. **Hardcode First, Database Later** (Hardened Core)
**Principle:** Make critical features unbreakable first

**Recommendation:**
- ✅ Hardcode demo/critical content (like Kobe video)
- ✅ Get it working perfectly
- ✅ Then add database as enhancement, not dependency

**Why This Works:**
- Product works even if database is down
- Users can demo/test immediately
- Add persistence layer incrementally

---

### 3. **Mobile-First Navigation** (iOS/Android Best Practices)
**Principle:** Navigation at top, not bottom

**Recommendation:**
- ✅ Top navigation (avoids browser UI conflicts)
- ✅ Clear iconography with labels
- ✅ Maximum 5-6 main actions visible
- ✅ Use hamburger menu for secondary actions

**Top Engineers Say:**
- "If you need more than 5 icons, your app is too complex"
- "Users should understand navigation without reading docs"

---

### 4. **Feature Flagging** (Airbnb/Netflix Approach)
**Principle:** Can enable/disable features instantly

**For Your Case:**
- Life chapters? Turn it OFF with a flag
- If needed later, turn it back ON
- Don't delete code permanently (archive it)

**Implementation:**
```typescript
const FEATURES = {
  LIFE_CHAPTERS: false,  // Disabled
  SLIDESHOW: true,       // Enabled
  HEAVEN_DEMO: true,     // Enabled
};
```

---

### 5. **Separation of Concerns** (Clean Architecture)
**Principle:** Clear boundaries between features

**Recommendation:**
```
/heaven → Fundraising page (separate purpose)
/heaven/[name] → Memorial pages (separate purpose)
/slideshow → Photo/video gallery (separate purpose)
/profile → User profile (separate purpose)
/memorial/[name] → Deceased profile (separate purpose)
```

**Top Engineers Say:**
- "If two features look similar, users get confused"
- "Each page should have ONE clear purpose"

---

### 6. **Backend as Enhancement, Not Dependency** (Progressive Enhancement)
**Principle:** App works without backend, better with it

**Recommendation:**
- ✅ Start with localStorage/hardcoded
- ✅ Get core UX working perfectly
- ✅ Add Supabase as enhancement layer
- ✅ Graceful degradation if Supabase is down

**Why This Works:**
- Faster to build (don't wait for backend)
- Easier to test (no database setup)
- More reliable (fallbacks exist)

---

### 7. **Code Cleanup as Ongoing Process** (Technical Debt)
**Principle:** Remove dead code immediately

**Recommendation:**
- ✅ Delete unused features immediately
- ✅ Don't comment out code "for later"
- ✅ Archive in separate branch if you want it later
- ✅ Keep codebase lean

**Top Engineers Say:**
- "Dead code is more dangerous than missing code"
- "A small, clean codebase > large, complex one"

---

### 8. **User-Centric Navigation** (Apple/Google Design)
**Principle:** Navigation should match user mental model

**Recommendation:**
```
Top Nav Structure:
[Home] [My Profile] [HEAVEN] [Plus] [Music] [Share]

Mental Model:
- Home = Main memorial view
- My Profile = My account (survivor)
- HEAVEN = Demo/investment
- Plus = Add content
- Music = Add music
- Share = Share/interact
```

**Top Engineers Say:**
- "If you need to explain navigation, it's wrong"
- "Users should know where they are instantly"

---

## Specific Recommendations for Your App

### 1. **Remove Life Chapters Now**
**Why:**
- Not using it = dead code
- Confuses navigation
- Adds maintenance burden
- Users don't need it

**Action:**
- Delete all life-chapters files
- Clean up navigation
- Simplify codebase

---

### 2. **Harden Slideshow with localStorage First**
**Why:**
- Works immediately (no backend setup needed)
- Users can test/use right away
- Add Supabase later as enhancement

**Action:**
- Keep localStorage for now
- Get slideshow working perfectly
- Then add Supabase as persistence layer

---

### 3. **Separate User Profile from Memorial Profile**
**Why:**
- Confusion = bad UX
- Different purposes need different pages
- Clearer mental model

**Action:**
- `/profile` or `/my-profile` = User's own profile (survivor)
- `/memorial/[name]` = Deceased loved one's profile
- Make them visually distinct

---

### 4. **Hardcode HEAVEN Demo Page**
**Why:**
- Fundraising needs to work 100% of the time
- No dependencies = no failures
- Quick to build and test

**Action:**
- Hardcode demo video (Mux)
- Hardcode text content
- Hardcode NetCapital link
- Zero API calls

---

### 5. **Top Navigation Only**
**Why:**
- Mobile browser bars at bottom
- Standard web pattern
- Better UX

**Action:**
- Rename BottomNav → TopNav
- Keep at top
- Clear iconography

---

## Priority Order (What to Do First)

### **Week 1: Cleanup**
1. Remove life chapters (13+ files)
2. Remove HEAVEN streaming/complex features (17 files)
3. Rename BottomNav → TopNav
4. Clean up navigation

### **Week 2: Simplify**
1. Hardcode HEAVEN demo page
2. Separate user profile from memorial profile
3. Clarify navigation icons/purposes

### **Week 3: Enhance**
1. Add Supabase backend to slideshow
2. Connect user profiles to database
3. Connect memorials to database

---

## Anti-Patterns to Avoid

### ❌ **Don't Do This:**
1. Build complex backend before core UX works
2. Keep unused features "just in case"
3. Mix concerns (user profile = memorial profile)
4. Bottom navigation on mobile web
5. Dependencies on external services for critical features

### ✅ **Do This Instead:**
1. Build core UX first, add backend later
2. Delete unused code immediately
3. Separate concerns clearly
4. Top navigation on mobile
5. Hardcode critical features, enhance with services

---

## Bottom Line

**Top Engineers Would Say:**

1. **"Delete life chapters immediately"** - Dead code slows you down
2. **"Hardcode HEAVEN demo"** - Fundraising must work 100%
3. **"Top nav, not bottom"** - Standard mobile pattern
4. **"Separate user from memorial"** - Clear mental model
5. **"Backend as enhancement"** - Get UX perfect first
6. **"Small, clean codebase"** - Easier to maintain and scale

**The Strategy:**
- Simplify → Harden → Enhance
- Remove before adding
- Hardcode before database
- Mobile-first, always

---

## Next Steps

**Recommended Order:**
1. ✅ Cleanup: Remove life chapters + HEAVEN complex features
2. ✅ Simplify: Hardcode HEAVEN demo page
3. ✅ Clarify: Separate user profile from memorial profile
4. ✅ Navigation: Rename to TopNav, clarify icons
5. ⏳ Enhance: Add Supabase backend to slideshow (later)

**This approach:**
- Gets you shipping faster
- Reduces complexity
- Improves reliability
- Makes future development easier

