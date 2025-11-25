-- ============================================
-- UPDATE KELLY WONG VIDEO IN SUPABASE
-- ============================================
-- This script inserts/updates the Kelly Wong video record
-- Use this to ensure the video is properly stored in Supabase
-- Works for both dashqrcodes.com and dashmemories.com
-- ============================================
-- 
-- INSTRUCTIONS:
-- 1. Replace 'YOUR_VIDEO_URL_HERE' with the actual working video URL
--    (The video URL from dashqrcodes.com/heaven-kelly-wong)
-- 2. Copy and paste this entire script into Supabase SQL Editor
-- 3. Run the script
-- ============================================

BEGIN;

-- ============================================
-- STEP 1: Clean up any existing kelly-wong records
-- ============================================
DELETE FROM public.heaven_characters 
WHERE user_id IN ('demo', 'default')
  AND character_id = 'kelly-wong';

-- ============================================
-- STEP 2: Insert Kelly Wong video for demo user
-- ============================================
-- This is used by /heaven/kelly-wong route

INSERT INTO public.heaven_characters (
  user_id,
  memorial_id,
  character_id,
  slideshow_video_url,
  created_at,
  updated_at
)
VALUES (
  'demo',
  NULL, -- memorial_id is UUID type, so NULL is fine
  'kelly-wong', -- This is how we identify the record
  'YOUR_VIDEO_URL_HERE', -- ⚠️ REPLACE THIS with actual video URL
  now(),
  now()
);

-- ============================================
-- STEP 3: Insert Kelly Wong video for default user
-- ============================================
-- This can be used by /heaven route as fallback

INSERT INTO public.heaven_characters (
  user_id,
  memorial_id,
  character_id,
  slideshow_video_url,
  created_at,
  updated_at
)
VALUES (
  'default',
  NULL,
  'kelly-wong',
  'YOUR_VIDEO_URL_HERE', -- ⚠️ REPLACE THIS with same video URL as above
  now(),
  now()
);

COMMIT;

-- ============================================
-- VERIFICATION
-- ============================================
-- After running, verify the records were created:

SELECT 
  user_id,
  character_id,
  CASE 
    WHEN length(slideshow_video_url) > 60 THEN substring(slideshow_video_url, 1, 60) || '...'
    ELSE slideshow_video_url
  END as video_url_preview,
  updated_at 
FROM public.heaven_characters 
WHERE user_id IN ('demo', 'default')
  AND character_id = 'kelly-wong'
ORDER BY user_id;

-- ============================================
-- TO UPDATE THE VIDEO URL LATER
-- ============================================
-- If you need to update the video URL later, run:

-- UPDATE public.heaven_characters
-- SET slideshow_video_url = 'NEW_VIDEO_URL_HERE',
--     updated_at = now()
-- WHERE user_id IN ('demo', 'default')
--   AND character_id = 'kelly-wong';
