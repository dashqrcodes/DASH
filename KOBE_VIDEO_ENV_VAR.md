# Kobe Video Environment Variable

## Environment Variable Name

```
NEXT_PUBLIC_KOBE_DEMO_VIDEO
```

## What to Set It To

You have **2 options**:

### Option 1: Mux Video URL (Recommended)
```
https://stream.mux.com/BVzwixnKSqqpqmEdELwUWRIMQ7kKI02YZamR00wJdI624.m3u8
```

### Option 2: Mux Player URL
```
https://player.mux.com/BVzwixnKSqqpqmEdELwUWRIMQ7kKI02YZamR00wJdI624
```

## Where to Set It

**Vercel Dashboard:**
1. Go to: https://vercel.com/david-gastelums-projects/nextjs-auth-app/settings/environment-variables
2. Click **"Add New"**
3. **Key:** `NEXT_PUBLIC_KOBE_DEMO_VIDEO`
4. **Value:** `https://stream.mux.com/BVzwixnKSqqpqmEdELwUWRIMQ7kKI02YZamR00wJdI624.m3u8`
5. **Environment:** Production (check this)
6. Click **Save**
7. **Redeploy** your app (required!)

## How It Works

1. The code checks `NEXT_PUBLIC_KOBE_DEMO_VIDEO` first
2. Extracts the playback ID from the URL
3. Falls back to hardcoded playback ID if env var not set
4. Uses Mux iframe player to display video

## Current Playback ID

```
BVzwixnKSqqpqmEdELwUWRIMQ7kKI02YZamR00wJdI624
```

