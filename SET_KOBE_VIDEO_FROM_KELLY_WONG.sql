-- ============================================
-- SET KOBE BRYANT VIDEO TO KELLY WONG VIDEO
-- ============================================
-- This script copies the Kelly Wong video URL to Kobe Bryant
-- Based on: https://www.dashqrcodes.com/heaven-kelly-wong
-- ============================================
-- 
-- INSTRUCTIONS:
-- 1. Copy and paste this entire script into Supabase SQL Editor
-- 2. Run the script
-- 3. This will use the Kelly Wong video as the default for Kobe Bryant
-- ============================================

BEGIN;

-- ============================================
-- STEP 1: Get Kelly Wong video URL and copy to Kobe Bryant
-- ============================================

-- First, get the Kelly Wong video URL
WITH kelly_video AS (
  SELECT slideshow_video_url
  FROM public.heaven_characters
  WHERE user_id IN ('demo', 'default')
    AND character_id = 'kelly-wong'
    AND slideshow_video_url IS NOT NULL
  LIMIT 1
)
-- Update or insert Kobe Bryant record with Kelly Wong's video URL
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
  kv.slideshow_video_url,
  now(),
  now()
FROM kelly_video kv
WHERE EXISTS (SELECT 1 FROM kelly_video)
ON CONFLICT DO NOTHING;

-- ============================================
-- STEP 2: Update existing Kobe Bryant record if it exists
-- ============================================

UPDATE public.heaven_characters
SET slideshow_video_url = (
  SELECT slideshow_video_url
  FROM public.heaven_characters
  WHERE user_id IN ('demo', 'default')
    AND character_id = 'kelly-wong'
    AND slideshow_video_url IS NOT NULL
  LIMIT 1
),
updated_at = now()
WHERE user_id = 'demo'
  AND character_id = 'kobe-bryant'
  AND EXISTS (
    SELECT 1
    FROM public.heaven_characters
    WHERE user_id IN ('demo', 'default')
      AND character_id = 'kelly-wong'
      AND slideshow_video_url IS NOT NULL
  );

-- ============================================
-- STEP 3: Also update default user_id record
-- ============================================

-- Insert or update for default user_id
WITH kelly_video AS (
  SELECT slideshow_video_url
  FROM public.heaven_characters
  WHERE user_id IN ('demo', 'default')
    AND character_id = 'kelly-wong'
    AND slideshow_video_url IS NOT NULL
  LIMIT 1
)
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
  kv.slideshow_video_url,
  now(),
  now()
FROM kelly_video kv
WHERE EXISTS (SELECT 1 FROM kelly_video)
ON CONFLICT DO NOTHING;

-- Update existing default record
UPDATE public.heaven_characters
SET slideshow_video_url = (
  SELECT slideshow_video_url
  FROM public.heaven_characters
  WHERE user_id IN ('demo', 'default')
    AND character_id = 'kelly-wong'
    AND slideshow_video_url IS NOT NULL
  LIMIT 1
),
updated_at = now()
WHERE user_id = 'default'
  AND character_id = 'kobe-bryant'
  AND EXISTS (
    SELECT 1
    FROM public.heaven_characters
    WHERE user_id IN ('demo', 'default')
      AND character_id = 'kelly-wong'
      AND slideshow_video_url IS NOT NULL
  );

COMMIT;

-- ============================================
-- VERIFICATION
-- ============================================
-- After running, verify both records have the same video URL:

SELECT 
  user_id,
  character_id,
  CASE 
    WHEN length(slideshow_video_url) > 60 THEN substring(slideshow_video_url, 1, 60) || '...'
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
-- Both kelly-wong and kobe-bryant should show the same video URL
-- This means Kobe Bryant will use Kelly Wong's video as default

