-- ============================================
-- COPY KELLY WONG VIDEO TO KOBE BRYANT
-- ============================================
-- This script copies the Kelly Wong video URL to Kobe Bryant
-- Makes the Kelly Wong video the default for Kobe Bryant
-- ============================================
-- 
-- INSTRUCTIONS:
-- 1. Copy and paste this entire script into Supabase SQL Editor
-- 2. Run the script
-- 3. This will copy Kelly Wong's video URL to Kobe Bryant records
-- ============================================

BEGIN;

-- ============================================
-- COPY KELLY WONG VIDEO TO KOBE BRYANT (demo user)
-- ============================================

-- Update existing Kobe Bryant record with Kelly Wong's video URL
UPDATE public.heaven_characters kobe
SET slideshow_video_url = (
  SELECT slideshow_video_url
  FROM public.heaven_characters kelly
  WHERE kelly.character_id = 'kelly-wong'
    AND kelly.user_id IN ('demo', 'default')
    AND kelly.slideshow_video_url IS NOT NULL
  LIMIT 1
),
updated_at = now()
WHERE kobe.character_id = 'kobe-bryant'
  AND kobe.user_id = 'demo'
  AND EXISTS (
    SELECT 1
    FROM public.heaven_characters kelly
    WHERE kelly.character_id = 'kelly-wong'
      AND kelly.user_id IN ('demo', 'default')
      AND kelly.slideshow_video_url IS NOT NULL
  );

-- Insert Kobe Bryant record if it doesn't exist (using Kelly Wong's video)
INSERT INTO public.heaven_characters (
  user_id,
  memorial_id,
  character_id,
  slideshow_video_url,
  created_at,
  updated_at
)
SELECT 
  'demo',
  NULL,
  'kobe-bryant',
  kelly.slideshow_video_url,
  now(),
  now()
FROM public.heaven_characters kelly
WHERE kelly.character_id = 'kelly-wong'
  AND kelly.user_id IN ('demo', 'default')
  AND kelly.slideshow_video_url IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM public.heaven_characters kobe
    WHERE kobe.character_id = 'kobe-bryant'
      AND kobe.user_id = 'demo'
  )
LIMIT 1;

-- ============================================
-- COPY KELLY WONG VIDEO TO KOBE BRYANT (default user)
-- ============================================

-- Update existing Kobe Bryant record with Kelly Wong's video URL
UPDATE public.heaven_characters kobe
SET slideshow_video_url = (
  SELECT slideshow_video_url
  FROM public.heaven_characters kelly
  WHERE kelly.character_id = 'kelly-wong'
    AND kelly.user_id IN ('demo', 'default')
    AND kelly.slideshow_video_url IS NOT NULL
  LIMIT 1
),
updated_at = now()
WHERE kobe.character_id = 'kobe-bryant'
  AND kobe.user_id = 'default'
  AND EXISTS (
    SELECT 1
    FROM public.heaven_characters kelly
    WHERE kelly.character_id = 'kelly-wong'
      AND kelly.user_id IN ('demo', 'default')
      AND kelly.slideshow_video_url IS NOT NULL
  );

-- Insert Kobe Bryant record if it doesn't exist (using Kelly Wong's video)
INSERT INTO public.heaven_characters (
  user_id,
  memorial_id,
  character_id,
  slideshow_video_url,
  created_at,
  updated_at
)
SELECT 
  'default',
  NULL,
  'kobe-bryant',
  kelly.slideshow_video_url,
  now(),
  now()
FROM public.heaven_characters kelly
WHERE kelly.character_id = 'kelly-wong'
  AND kelly.user_id IN ('demo', 'default')
  AND kelly.slideshow_video_url IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM public.heaven_characters kobe
    WHERE kobe.character_id = 'kobe-bryant'
      AND kobe.user_id = 'default'
  )
LIMIT 1;

COMMIT;

-- ============================================
-- VERIFICATION
-- ============================================
-- After running, verify both Kelly Wong and Kobe Bryant have the same video URL:

SELECT 
  user_id,
  character_id,
  CASE 
    WHEN length(slideshow_video_url) > 70 THEN substring(slideshow_video_url, 1, 70) || '...'
    ELSE slideshow_video_url
  END as video_url_preview,
  updated_at 
FROM public.heaven_characters 
WHERE character_id IN ('kelly-wong', 'kobe-bryant')
  AND user_id IN ('demo', 'default')
ORDER BY character_id, user_id;

-- ============================================
-- EXPECTED RESULT
-- ============================================
-- Both kelly-wong and kobe-bryant should show the SAME video URL
-- This means Kobe Bryant will now use Kelly Wong's video as default

