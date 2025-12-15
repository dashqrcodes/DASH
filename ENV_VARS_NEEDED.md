# 🔐 Environment Variables Needed for /heaven/kobe-bryant

## Required for Mux Video Playback:

1. **MUX_TOKEN_ID**
   - Mux API token ID
   - Used by: `lib/utils/mux.ts`
   - Purpose: Authenticate Mux API calls

2. **MUX_TOKEN_SECRET**
   - Mux API token secret
   - Used by: `lib/utils/mux.ts`
   - Purpose: Authenticate Mux API calls

## Optional (for fallback):

3. **NEXT_PUBLIC_KOBE_DEMO_VIDEO**
   - Direct video URL for Kobe Bryant demo
   - Used by: `app/heaven/[name]/page.tsx`
   - Purpose: Fallback if playbackId not found

4. **NEXT_PUBLIC_KELLY_DEMO_VIDEO**
   - Direct video URL for Kelly Wong demo
   - Used by: `app/heaven/[name]/page.tsx`
   - Purpose: Fallback if playbackId not found

## Current Setup:

- Hardcoded playbackId for kobe-bryant: `BVzwixnKSqqpqmEdELwUWRIMQ7kKI02YZamR00wJdI624`
- This works WITHOUT environment variables (hardcoded fallback)
- But for full functionality, MUX_TOKEN_ID and MUX_TOKEN_SECRET are needed

## To Add to Vercel:

1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Add:
   - `MUX_TOKEN_ID` = (your Mux token ID)
   - `MUX_TOKEN_SECRET` = (your Mux token secret)
   - `NEXT_PUBLIC_KOBE_DEMO_VIDEO` = (optional, direct video URL)
3. Redeploy

