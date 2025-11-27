# Slideshow Backend - What Needs to Be Done

## Current State ✅

### What's Working:
1. **Supabase Functions Exist:**
   - `uploadSlideshowMedia()` - Uploads photos/videos to Supabase Storage
   - `storeSlideshowMedia()` - Saves media metadata to `slideshow_media` table
   - `getSlideshowMedia()` - Retrieves media from database

2. **Code Already Tries Supabase:**
   - Line 427-458: Tries to load from Supabase first
   - Falls back to localStorage if Supabase fails
   - Line 177-322: Tries to upload/save to Supabase when photos added

3. **Problem:** The `userId` and `memorialId` are **temporary/localStorage-based**, not real user IDs

---

## The Problem 🚨

### Current Implementation (Lines 95-117):

```typescript
const getUserId = (): string => {
  // ⚠️ PROBLEM: Just creates a random ID, stores in localStorage
  let userId = localStorage.getItem('userId');
  if (!userId) {
    userId = `user-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    localStorage.setItem('userId', userId);
  }
  return userId;
}

const getMemorialId = (): string => {
  // ⚠️ PROBLEM: Just creates a random ID, stores in localStorage
  let memorialId = localStorage.getItem('memorialId');
  if (!memorialId) {
    const identifier = lovedOneName || `default-${Date.now()}`;
    memorialId = `memorial-${btoa(identifier).replace(/[^a-zA-Z0-9]/g, '').substring(0, 20)}-${Date.now()}`;
    localStorage.setItem('memorialId', memorialId);
  }
  return memorialId;
}
```

### Why This Is A Problem:
1. **No Real User Authentication:**
   - Creates fake IDs like `user-1234567890-abc123`
   - Not connected to actual user accounts
   - Lost if user clears browser data

2. **Not Connected to Supabase Auth:**
   - Should use `supabase.auth.getUser()` to get real user ID
   - Should create/link to actual memorial records

3. **Data Isolation Issues:**
   - Different devices = different fake IDs
   - Can't share memorials between devices
   - Can't access from other browsers

---

## What "Proceed with Slideshow Backend" Means 🔧

### Step 1: Connect to Real User Authentication

**Replace fake IDs with real ones:**

```typescript
// OLD (current):
const getUserId = (): string => {
  let userId = localStorage.getItem('userId');
  if (!userId) {
    userId = `user-${Date.now()}-${Math.random()...}`; // Fake ID
    localStorage.setItem('userId', userId);
  }
  return userId;
}

// NEW (what we need):
const getUserId = async (): Promise<string | null> => {
  // Get real user from Supabase Auth
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (user) {
    return user.id; // Real UUID from Supabase
  }
  
  // If not logged in, check if user needs to sign up
  return null; // User needs to authenticate first
}
```

---

### Step 2: Connect to Real Memorial Records

**Link slideshow to actual memorial in database:**

```typescript
// OLD (current):
const getMemorialId = (): string => {
  let memorialId = localStorage.getItem('memorialId');
  if (!memorialId) {
    memorialId = `memorial-${btoa(lovedOneName)...}`; // Fake ID
    localStorage.setItem('memorialId', memorialId);
  }
  return memorialId;
}

// NEW (what we need):
const getMemorialId = async (userId: string): Promise<string | null> => {
  // Option 1: Get from URL params (if viewing specific memorial)
  const router = useRouter();
  if (router.query.memorial) {
    return router.query.memorial as string;
  }
  
  // Option 2: Get from URL path (if at /memorial/[name])
  if (router.pathname.includes('/memorial/')) {
    const memorialSlug = router.query.name;
    // Fetch memorial ID from database using slug
    const { data } = await supabase
      .from('memorials')
      .select('id')
      .eq('slug', memorialSlug)
      .eq('user_id', userId)
      .single();
    return data?.id || null;
  }
  
  // Option 3: Create new memorial or use default
  // (This would require creating memorial first)
  return null;
}
```

---

### Step 3: Handle Unauthenticated Users

**What happens if user isn't logged in?**

**Option A: Require Sign-Up (Strict)**
- Redirect to `/sign-up` if no user
- Can't use slideshow without account
- Pro: Data always saved properly
- Con: Requires sign-up before using

**Option B: Allow Anonymous (Flexible)**
- Use localStorage for anonymous users
- Prompt to "Save to account" when ready
- Pro: Can try app without sign-up
- Con: Data might be lost

**Recommended:** Option B (Anonymous with "Save" prompt)

---

### Step 4: Update Save/Load Functions

**Make functions async and handle auth:**

```typescript
// Current (lines 123-175):
const savePhotos = async (mediaItems: MediaItem[]) => {
  const userId = getUserId(); // ❌ Synchronous, fake ID
  const memorialId = getMemorialId(); // ❌ Synchronous, fake ID
  
  // Save to localStorage
  localStorage.setItem('slideshowMedia', JSON.stringify(serialized));
  
  // Try to save to Supabase
  await storeSlideshowMedia(userId, memorialId, mediaItems);
}

// New (what we need):
const savePhotos = async (mediaItems: MediaItem[]) => {
  // Get real user ID
  const userId = await getUserId();
  
  if (!userId) {
    // Not logged in - just save to localStorage
    localStorage.setItem('slideshowMedia', JSON.stringify(serialized));
    // Show prompt: "Sign up to save permanently"
    return;
  }
  
  // Get real memorial ID
  const memorialId = await getMemorialId(userId);
  
  if (!memorialId) {
    // No memorial linked - create one or prompt user
    // Could create default memorial or show modal
    return;
  }
  
  // Save to Supabase (real persistence)
  await storeSlideshowMedia(userId, memorialId, mediaItems);
  
  // Also save to localStorage as backup
  localStorage.setItem('slideshowMedia', JSON.stringify(serialized));
}
```

---

## Implementation Checklist ✅

### Phase 1: Authentication Integration
- [ ] Create `getRealUserId()` function using `supabase.auth.getUser()`
- [ ] Handle unauthenticated users (redirect or allow anonymous)
- [ ] Update all `getUserId()` calls to use real auth

### Phase 2: Memorial Integration
- [ ] Create `getRealMemorialId()` function
- [ ] Link to memorial from URL or create new memorial
- [ ] Update all `getMemorialId()` calls to use real memorials

### Phase 3: Save/Load Updates
- [ ] Update `savePhotos()` to use real IDs
- [ ] Update `loadMediaFromCloud()` to use real IDs
- [ ] Add "Save to Account" prompt for anonymous users
- [ ] Test save/load across devices

### Phase 4: Error Handling
- [ ] Handle Supabase connection errors gracefully
- [ ] Fallback to localStorage if Supabase fails
- [ ] Show user-friendly error messages
- [ ] Log errors for debugging

### Phase 5: Testing
- [ ] Test with logged-in user
- [ ] Test with anonymous user
- [ ] Test creating new memorial
- [ ] Test loading existing memorial
- [ ] Test cross-device access

---

## Expected Outcome 🎯

### Before:
- Photos saved to localStorage only
- Lost if browser data cleared
- Not accessible on other devices
- Fake user/memorial IDs

### After:
- Photos saved to Supabase Storage
- Metadata saved to `slideshow_media` table
- Accessible from any device (if logged in)
- Real user/memorial IDs
- Falls back to localStorage if Supabase fails
- "Save to Account" prompt for anonymous users

---

## Time Estimate ⏱️

- **Phase 1 (Auth):** 1-2 hours
- **Phase 2 (Memorials):** 1-2 hours
- **Phase 3 (Save/Load):** 1-2 hours
- **Phase 4 (Errors):** 1 hour
- **Phase 5 (Testing):** 1-2 hours

**Total: 5-9 hours** (could be faster if you know the codebase well)

---

## Risk Level 🎲

**Medium Risk:**
- Touching persistence layer (could break save/load)
- Need to handle authentication edge cases
- Need to test thoroughly

**Mitigation:**
- Keep localStorage as fallback
- Test on dev before production
- Gradual rollout (can revert if issues)

---

## Summary 📝

**"Proceed with slideshow backend" means:**
1. Replace fake localStorage IDs with real Supabase user IDs
2. Link slideshows to actual memorial records in database
3. Make save/load work across devices
4. Handle unauthenticated users gracefully
5. Test thoroughly

**The result:** Slideshow photos/videos persist properly in Supabase, accessible from any device when logged in, with localStorage as backup.

---

## Questions to Answer First 🤔

Before implementing, we need to know:

1. **Authentication Flow:**
   - Do users sign up before using slideshow?
   - Or can they use slideshow anonymously first?

2. **Memorial Creation:**
   - Is memorial created before accessing slideshow?
   - Or should slideshow create memorial automatically?

3. **URL Structure:**
   - Are slideshows accessed via `/slideshow?memorial=xyz`?
   - Or `/memorial/[name]/slideshow`?
   - Or just `/slideshow` (generic)?

4. **User Flow:**
   - User signs up → Creates memorial → Uploads photos?
   - Or User uploads photos → Creates memorial → Signs up?

These answers determine the implementation approach.

