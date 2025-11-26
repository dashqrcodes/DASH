-- ============================================
-- DELETE UNUSED SUPABASE TABLES
-- ============================================
-- ⚠️ WARNING: This will permanently delete these tables!
-- Only run if you're sure you don't need them
-- ============================================
--
-- INSTRUCTIONS:
-- 1. Review the tables below
-- 2. Modify the list if needed
-- 3. Copy and paste this ENTIRE script into Supabase SQL Editor
-- 4. Click "Run"
-- ============================================

BEGIN;

-- ============================================
-- DELETE UNUSED TABLES
-- ============================================

-- Drop unused tables (modify list as needed)
DROP TABLE IF EXISTS public.ai_jobs CASCADE;
DROP TABLE IF EXISTS public.avatars CASCADE;
DROP TABLE IF EXISTS public.calls CASCADE;
DROP TABLE IF EXISTS public.collaborators CASCADE;
DROP TABLE IF EXISTS public.comments CASCADE;
DROP TABLE IF EXISTS public.likes CASCADE;
DROP TABLE IF EXISTS public.media CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.slideshows CASCADE;
DROP TABLE IF EXISTS public.voices CASCADE;

COMMIT;

-- ============================================
-- VERIFICATION
-- ============================================
-- After running, check what tables remain:

SELECT 
  table_name,
  '✅ Kept' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- ============================================
-- EXPECTED RESULT
-- ============================================
-- You should see:
-- - heaven_characters ✅ (required for videos)
-- - slideshow_media ✅ (if you use slideshow feature)
-- - memorials ✅ (if you use account/memorial feature)
--
-- All other tables should be deleted!

