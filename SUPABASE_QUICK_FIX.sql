-- ============================================
-- QUICK FIX: Check if auth.users exists
-- ============================================
-- Run this FIRST in Supabase SQL Editor to verify authentication is enabled

-- Check if auth.users table exists
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users')
    THEN '✅ auth.users exists - Authentication is enabled'
    ELSE '❌ auth.users does NOT exist - Enable Authentication in Supabase Dashboard first!'
  END AS auth_status;

-- Check which tables exist and if they have user_id column
SELECT 
  t.table_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns c 
      WHERE c.table_schema = 'public' 
      AND c.table_name = t.table_name 
      AND c.column_name = 'user_id'
    ) THEN '✅ Has user_id'
    ELSE '❌ Missing user_id'
  END AS user_id_status
FROM information_schema.tables t
WHERE t.table_schema = 'public'
AND t.table_name IN ('memorials', 'slideshow_media', 'heaven_characters', 'media', 'calls', 'avatars', 'voices', 'slideshows', 'profiles', 'collaborators', 'comments', 'likes', 'orders', 'payments', 'notifications', 'ai_jobs')
ORDER BY t.table_name;


