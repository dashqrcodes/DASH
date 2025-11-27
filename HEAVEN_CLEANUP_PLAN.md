# HEAVEN Page Cleanup & Preparation Plan

## Current State Analysis

### What Currently Exists:

#### 1. **Main Heaven Page** (`/heaven.tsx`)
- ❌ Complex video loading logic (env vars, Supabase, localStorage)
- ❌ Uses native `<video>` tag (less reliable)
- ❌ Lots of error handling for dynamic loading
- ✅ Basic structure exists

#### 2. **Individual Memorial Heaven Pages** (`/heaven/[name].tsx`)
- ✅ This is HARDENED and should STAY (Kobe video works!)
- ✅ Uses Mux iframe (reliable)
- ✅ Hardcoded playback ID for Kobe
- ⚠️ Keep this separate from main `/heaven` page

#### 3. **Complex Features to Retire/Archive:**

**HeyGen Streaming Features:**
- ❌ `/api/heaven/heygen-streaming.ts` - Real-time avatar streaming
- ❌ `/api/heaven/create-avatar.ts` - Avatar creation
- ❌ `/api/heaven/clone-voice.ts` - Voice cloning
- ❌ `/api/heaven/generate-talking-video.ts` - Video generation
- ❌ `/components/StreamingAvatarVideo.tsx` - Streaming component
- ❌ `/components/AvatarVideo.tsx` - Avatar video component
- ❌ `/utils/heygen-streaming.ts` - HeyGen utilities
- ❌ `/utils/heaven-avatar.ts` - Avatar utilities
- ❌ `/config/heaven.ts` - Heaven config

**ConVai Integration:**
- ❌ `/api/convai/start-conversation.ts` - ConVai conversation API
- ❌ `/utils/convai-integration.ts` - ConVai utilities
- ❌ `/components/ChatInput.tsx` - Chat input (may be used elsewhere)
- ❌ `/components/CallHeader.tsx` - Call header component

**Video Call Features:**
- ❌ `BottomNav.tsx` - `handleHeavenCall()` function (line 14-17)
- ❌ Query param `?call=true` handling

**Complex Video APIs:**
- ❌ `/api/heaven/video-proxy.ts` - Video proxy (probably not needed)
- ❌ `/api/heaven/extract-audio.ts` - Audio extraction
- ❌ `/api/heaven/synthesize-speech.ts` - Speech synthesis

#### 4. **Keep/Archive:**

**Keep (Still Useful):**
- ✅ `/api/heaven/upload-demo-video.ts` - Upload to Supabase (might use)
- ✅ `/api/heaven/upload-to-mux.ts` - Upload to Mux (might use)
- ✅ `/api/heaven/set-video-url.ts` - Set video URL (might use)
- ✅ `/api/heaven/get-profiles.ts` - Get profiles (might use)
- ✅ `/api/heaven/update-profile.ts` - Update profiles (might use)
- ✅ `/api/heaven/auto-setup-video.ts` - Auto setup (might use)
- ✅ `/heaven/[name].tsx` - Individual memorial pages (KEEP!)

**Archive/Remove:**
- ⚠️ `/heaven-simple.tsx` - Test page (can delete)
- ⚠️ `/heaven-kobe-bryant.tsx` - Test page (can delete)

---

## Cleanup Strategy

### Phase 1: Remove Complex/Unused Features

**Files to DELETE:**
1. `src/pages/api/heaven/heygen-streaming.ts`
2. `src/pages/api/heaven/create-avatar.ts`
3. `src/pages/api/heaven/clone-voice.ts`
4. `src/pages/api/heaven/generate-talking-video.ts`
5. `src/pages/api/heaven/synthesize-speech.ts`
6. `src/pages/api/heaven/extract-audio.ts`
7. `src/pages/api/convai/start-conversation.ts`
8. `src/pages/api/heaven/video-proxy.ts`
9. `src/components/StreamingAvatarVideo.tsx`
10. `src/components/AvatarVideo.tsx`
11. `src/utils/heygen-streaming.ts`
12. `src/utils/heaven-avatar.ts`
13. `src/utils/convai-integration.ts`
14. `src/components/CallHeader.tsx` (if not used elsewhere)
15. `src/pages/heaven-simple.tsx`
16. `src/pages/heaven-kobe-bryant.tsx`
17. `src/config/heaven.ts`

**Files to MODIFY:**
1. `src/pages/heaven.tsx` - Simplify to hardcoded demo page
2. `src/components/BottomNav.tsx` - Remove `handleHeavenCall()` function
3. `src/components/ChatInput.tsx` - Keep if used elsewhere, check usage

### Phase 2: Create New Simple HEAVEN Page

**New `/heaven.tsx` structure:**
1. **Hero Section:** Hardcoded demo video (Mux iframe, like Kobe)
2. **About Section:** What HEAVEN is (text content)
3. **Vision Section:** Why invest (text content)
4. **CTA Section:** NetCapital investment button/link
5. **All hardcoded** - no API calls, no database

---

## What to Keep Separate

### **KEEP SEPARATE:**
- `/heaven/[name].tsx` - Individual memorial pages
  - This is for deceased loved ones (e.g., `/heaven/kobe-bryant`)
  - Should remain hardened and functional
  - Different purpose than main `/heaven` page

### **NEW MAIN PAGE:**
- `/heaven.tsx` - Fundraising/demo page
  - Explainer video
  - About HEAVEN
  - NetCapital link
  - Different purpose (fundraising, not memorial)

---

## Code to Remove from BottomNav

**Current code (remove):**
```typescript
const handleHeavenCall = () => {
    // Navigate to heaven page and trigger call
    router.push('/heaven?call=true');
};
```

**New code (simple redirect):**
```typescript
const handleHeaven = () => {
    router.push('/heaven'); // Just go to heaven page, no call params
};
```

---

## Summary

### Files to DELETE: 17 files
### Files to MODIFY: 2-3 files
### New files to CREATE: 1 (simplified `/heaven.tsx`)

**Total cleanup:** Remove ~17 complex/unused files, simplify main heaven page.

