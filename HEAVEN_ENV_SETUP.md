# HEAVEN Environment Variables Setup

Create a `.env.local` file in the project root with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://ftgrrlkjavcumjkyyyva.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Base URL (automatically set by Vercel in production)
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Optional: External slideshow video/photo URLs
# If not provided, HEAVEN will use slideshowMedia from localStorage
NEXT_PUBLIC_SLIDESHOW_VIDEO_URL=
NEXT_PUBLIC_PRIMARY_PHOTO_URL=
```

## Setup Instructions

1. Copy template above to `.env.local`
2. Get Supabase Anon Key: https://supabase.com/dashboard → Settings → API
3. Add keys to `.env.local`
4. Create Supabase Storage bucket: See `SUPABASE_SETUP.md`
5. Restart dev server: `npm run dev`

## Vercel Deployment

Add these environment variables in Vercel dashboard:
- `NEXT_PUBLIC_BASE_URL` (auto-set by Vercel)
- Supabase credentials (if needed)

