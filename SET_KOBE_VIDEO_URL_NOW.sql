-- ============================================
-- SET KOBE BRYANT VIDEO URL - QUICK FIX
-- ============================================
-- This script sets the video URL for Kobe Bryant
-- Use this to fix the "No video available" error
-- ============================================
-- 
-- INSTRUCTIONS:
-- 1. Go to Supabase Dashboard → SQL Editor
-- 2. Copy and paste this ENTIRE script
-- 3. Click "Run" or press Ctrl+Enter
-- 4. Verify the video URL is set
-- ============================================

BEGIN;

-- ============================================
-- SET VIDEO URL FOR KOBE BRYANT (demo user)
-- ============================================

-- Delete existing records first (to avoid duplicates)
DELETE FROM public.heaven_characters
WHERE character_id = 'kobe-bryant'
  AND user_id = 'demo';

-- Insert new record with video URL
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
  NULL,
  'kobe-bryant',
  'https://www.dashqrcodes.com/heaven-kobe-bryant',  -- ⚠️ VIDEO URL - New Kobe Bryant video
  now(),
  now()
);

-- ============================================
-- SET VIDEO URL FOR KOBE BRYANT (default user)
-- ============================================

-- Delete existing records first (to avoid duplicates)
DELETE FROM public.heaven_characters
WHERE character_id = 'kobe-bryant'
  AND user_id = 'default';

-- Insert new record with video URL
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
  'kobe-bryant',
  'https://www.dashqrcodes.com/heaven-kobe-bryant',  -- ⚠️ VIDEO URL - New Kobe Bryant video
  now(),
  now()
);

COMMIT;

-- ============================================
-- VERIFICATION
-- ============================================
-- After running, check that the video URL is set:

SELECT 
  user_id,
  character_id,
  slideshow_video_url,
  updated_at
FROM public.heaven_characters 
WHERE character_id = 'kobe-bryant'
  AND user_id IN ('demo', 'default')
ORDER BY user_id;

-- ============================================
-- EXPECTED RESULT
-- ============================================
-- You should see 2 rows:
-- 1. user_id='demo', character_id='kobe-bryant', slideshow_video_url='https://www.dashqrcodes.com/heaven-kobe-bryant'
-- 2. user_id='default', character_id='kobe-bryant', slideshow_video_url='https://www.dashqrcodes.com/heaven-kobe-bryant'
--
-- If you see this, the video URL is set! ✅
-- The page should now load the video after Supabase is configured.

