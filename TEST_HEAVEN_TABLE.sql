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
INSERT INTO public.heaven_characters (user_id, memorial_id, character_id, slideshow_video_url)
VALUES ('default', NULL, 'default', 'https://example.com/test-video.mp4')
ON CONFLICT (user_id, memorial_id) 
DO UPDATE SET 
  slideshow_video_url = EXCLUDED.slideshow_video_url,
  updated_at = now();

-- 4. Test SELECT (should work without authentication)
SELECT * FROM public.heaven_characters WHERE user_id = 'default';

-- 5. If you see data above, SUCCESS! The table is working!

