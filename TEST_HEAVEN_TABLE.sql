-- ============================================
-- TEST HEAVEN_CHARACTERS TABLE
-- ============================================
-- Run these queries one by one to verify everything works
-- ============================================

-- 1. Check if table exists and see its structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'heaven_characters'
ORDER BY ordinal_position;

-- 2. Check if policies exist
SELECT policyname, permissive, roles, cmd
FROM pg_policies 
WHERE tablename = 'heaven_characters';

-- 3. Test INSERT (should work without authentication)
-- ⚠️ IMPORTANT: Replace 'YOUR_VIDEO_URL_HERE' with an actual video URL!
-- Examples:
--   - https://www.dashqrcodes.com/heaven-kobe-bryant
--   - https://stream.mux.com/abc123.m3u8
--   - https://yourcdn.com/video.mp4
INSERT INTO public.heaven_characters (user_id, memorial_id, character_id, slideshow_video_url)
VALUES ('default', NULL, 'default', 'YOUR_VIDEO_URL_HERE')
ON CONFLICT (user_id, memorial_id) 
DO UPDATE SET 
  slideshow_video_url = EXCLUDED.slideshow_video_url,
  updated_at = now();

-- 4. Test SELECT (should work without authentication)
SELECT * FROM public.heaven_characters WHERE user_id = 'default';

-- 5. If you see data above, SUCCESS! The table is working!

