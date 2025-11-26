-- ============================================
-- CREATE HEAVEN_VIDEOS TABLE
-- ============================================
-- Dedicated table for storing Heaven video URLs
-- Follows the same patterns as heaven_characters table
-- ============================================

BEGIN;

-- ============================================
-- CREATE HEAVEN_VIDEOS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.heaven_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- Can be 'default', 'demo', or UUID string
  memorial_id UUID, -- Nullable - links to memorial if exists
  character_name TEXT, -- e.g., 'kobe-bryant', 'kelly-wong'
  video_url TEXT NOT NULL, -- The actual video URL
  video_type TEXT CHECK (video_type IN ('direct', 'webpage', 'mux', 'cloudinary', 'other')),
  thumbnail_url TEXT, -- Optional thumbnail/preview image
  title TEXT, -- Optional video title
  description TEXT, -- Optional description
  duration INTEGER, -- Duration in seconds (optional)
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  -- Ensure unique combination of user_id and character_name
  CONSTRAINT heaven_videos_user_character_unique UNIQUE (user_id, character_name)
);

-- ============================================
-- CREATE INDEXES
-- ============================================

-- Index for quick lookups by user_id
CREATE INDEX IF NOT EXISTS idx_heaven_videos_user_id 
  ON public.heaven_videos(user_id);

-- Index for quick lookups by character_name
CREATE INDEX IF NOT EXISTS idx_heaven_videos_character_name 
  ON public.heaven_videos(character_name);

-- Index for memorial_id lookups
CREATE INDEX IF NOT EXISTS idx_heaven_videos_memorial_id 
  ON public.heaven_videos(memorial_id) 
  WHERE memorial_id IS NOT NULL;

-- Index for video_url lookups
CREATE INDEX IF NOT EXISTS idx_heaven_videos_video_url 
  ON public.heaven_videos(video_url);

-- ============================================
-- CREATE UPDATED_AT TRIGGER
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_heaven_videos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS trg_heaven_videos_updated_at ON public.heaven_videos;
CREATE TRIGGER trg_heaven_videos_updated_at
  BEFORE UPDATE ON public.heaven_videos
  FOR EACH ROW
  EXECUTE FUNCTION update_heaven_videos_updated_at();

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.heaven_videos ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CREATE RLS POLICIES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "heaven_videos_allow_default_read" ON public.heaven_videos;
DROP POLICY IF EXISTS "heaven_videos_allow_default_insert" ON public.heaven_videos;
DROP POLICY IF EXISTS "heaven_videos_allow_default_update" ON public.heaven_videos;
DROP POLICY IF EXISTS "heaven_videos_allow_default_delete" ON public.heaven_videos;
DROP POLICY IF EXISTS "Users can read own heaven_videos" ON public.heaven_videos;
DROP POLICY IF EXISTS "Users can insert own heaven_videos" ON public.heaven_videos;
DROP POLICY IF EXISTS "Users can update own heaven_videos" ON public.heaven_videos;
DROP POLICY IF EXISTS "Users can delete own heaven_videos" ON public.heaven_videos;

-- Policy: Allow reading videos with user_id = 'default' (public access)
CREATE POLICY "heaven_videos_allow_default_read" 
  ON public.heaven_videos 
  FOR SELECT 
  USING (
    user_id = 'default' OR 
    user_id = 'demo' OR
    auth.uid()::text = user_id
  );

-- Policy: Allow inserting videos with user_id = 'default' (public access)
CREATE POLICY "heaven_videos_allow_default_insert" 
  ON public.heaven_videos 
  FOR INSERT 
  WITH CHECK (
    user_id = 'default' OR 
    user_id = 'demo' OR
    auth.uid()::text = user_id
  );

-- Policy: Allow updating videos with user_id = 'default' (public access)
CREATE POLICY "heaven_videos_allow_default_update" 
  ON public.heaven_videos 
  FOR UPDATE 
  USING (
    user_id = 'default' OR 
    user_id = 'demo' OR
    auth.uid()::text = user_id
  )
  WITH CHECK (
    user_id = 'default' OR 
    user_id = 'demo' OR
    auth.uid()::text = user_id
  );

-- Policy: Allow deleting videos with user_id = 'default' (public access)
CREATE POLICY "heaven_videos_allow_default_delete" 
  ON public.heaven_videos 
  FOR DELETE 
  USING (
    user_id = 'default' OR 
    user_id = 'demo' OR
    auth.uid()::text = user_id
  );

-- Additional policies for authenticated users
CREATE POLICY "Users can read own heaven_videos" 
  ON public.heaven_videos 
  FOR SELECT 
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own heaven_videos" 
  ON public.heaven_videos 
  FOR INSERT 
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own heaven_videos" 
  ON public.heaven_videos 
  FOR UPDATE 
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own heaven_videos" 
  ON public.heaven_videos 
  FOR DELETE 
  USING (auth.uid()::text = user_id);

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.heaven_videos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.heaven_videos TO authenticated;

COMMIT;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'heaven_videos'
ORDER BY ordinal_position;

-- Check indexes
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public' 
  AND tablename = 'heaven_videos';

-- Check RLS policies
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'heaven_videos';

-- ============================================
-- EXAMPLE USAGE
-- ============================================

-- Insert a test video (uncomment and replace URL with actual video URL):
/*
INSERT INTO public.heaven_videos (
  user_id, 
  character_name, 
  video_url,
  video_type,
  title
) VALUES (
  'default',
  'kobe-bryant',
  'YOUR_VIDEO_URL_HERE',
  'direct',
  'Kobe Bryant Memorial Video'
)
ON CONFLICT (user_id, character_name) 
DO UPDATE SET 
  video_url = EXCLUDED.video_url,
  updated_at = now();
*/

-- Select videos:
-- SELECT * FROM public.heaven_videos WHERE user_id = 'default' AND character_name = 'kobe-bryant';

