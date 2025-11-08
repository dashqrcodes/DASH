# HEAVEN Environment Variables Setup

Create a `.env.local` file in the project root with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://ftgrrlkjavcumjkyyyva.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Base URL (automatically set by Vercel in production)
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# ElevenLabs API (for voice cloning)
# Get your API key from: https://elevenlabs.io/app/settings/api-keys
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# D-ID API (for avatar creation)
# Get your API key from: https://studio.d-id.com/
DID_API_KEY=your_did_api_key_here

# HeyGen API (alternative to D-ID)
# Get your API key from: https://www.heygen.com/
HEYGEN_API_KEY=your_heygen_api_key_here

# Optional: External slideshow video/photo URLs
# If not provided, HEAVEN will use slideshowMedia from localStorage
NEXT_PUBLIC_SLIDESHOW_VIDEO_URL=
NEXT_PUBLIC_PRIMARY_PHOTO_URL=
```

## Setup Instructions

1. Copy template above to `.env.local`
2. Get Supabase Anon Key: https://supabase.com/dashboard → Settings → API
3. Get ElevenLabs API key: https://elevenlabs.io/app/settings/api-keys
4. Get D-ID API key: https://studio.d-id.com/
5. Add keys to `.env.local`
6. Create Supabase Storage bucket: See `SUPABASE_SETUP.md`
7. Restart dev server: `npm run dev`

## Vercel Deployment

Add these environment variables in Vercel dashboard:
- `ELEVENLABS_API_KEY`
- `DID_API_KEY` (or `HEYGEN_API_KEY`)
- `NEXT_PUBLIC_BASE_URL` (auto-set by Vercel)

