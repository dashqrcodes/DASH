# TikTok Gift Funnel - Dash Memories

Isolated TikTok product funnel for "Timeless Transparency Gift" feature.

## Structure

This project is fully contained in the `/gift-build` folder and can be deployed as a separate Vercel project.

## Routes

- `/gift` - TikTok landing page (upload photo/video, preview QR, checkout)
- `/[slug]/lovestory` - Permanent memory page (display photo, video, QR)

## API Routes

- `/api/checkout` - Stripe Checkout session creation
- `/api/generate-pdf` - Generate 5x7 inch PDF with photo and QR
- `/api/mux-upload-url` - Get Mux direct upload URL

## Libraries

- `lib/supabaseClient.ts` - Supabase client setup
- `lib/muxClient.ts` - Mux video upload handling
- `lib/colorEngine.ts` - Dominant color extraction and palette generation
- `lib/placementEngine.ts` - Intelligent QR code placement
- `lib/qrEngine.ts` - QR code generation with custom styling
- `lib/pdfGenerator.ts` - 5x7 inch PDF generation
- `lib/slugify.ts` - URL slug generation

## Setup

1. Install dependencies:
```bash
cd gift-build
npm install
```

2. Configure environment variables (copy `.env.example` to `.env.local`)

3. Set up Supabase:
   - Create new Supabase project
   - Create `stories` table:
     ```sql
     CREATE TABLE stories (
       id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
       slug TEXT UNIQUE NOT NULL,
       photo_url TEXT NOT NULL,
       video_url TEXT,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
     );
     ```
   - Create storage bucket: `photos`
   - Set up RLS policies

4. Configure Stripe:
   - Create product with $199 price
   - Add `STRIPE_PRICE_ID` to env

5. Configure Mux:
   - Get token ID and secret
   - Add to env variables

## Deployment

This folder can be deployed as a separate Vercel project. The main domain will rewrite `/gift*` routes to this project.


