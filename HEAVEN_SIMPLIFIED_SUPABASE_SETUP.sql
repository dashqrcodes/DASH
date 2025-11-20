-- ============================================
-- HEAVEN SIMPLIFIED - SUPABASE TABLE SETUP
-- ============================================
-- This creates/updates the heaven_characters table for the simplified video-only Heaven page
-- Removes dependency on AI features (voice cloning, avatars, etc.)
-- Just stores and retrieves video URLs
-- ============================================

BEGIN;

-- ============================================
-- CREATE HEAVEN_CHARACTERS TABLE (if it doesn't exist)
-- ============================================

CREATE TABLE IF NOT EXISTS public.heaven_characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- Can be 'default', 'demo', or UUID string
  memorial_id UUID, -- Nullable - allows storing videos without full memorial setup
  character_id TEXT, -- Optional - not needed for video-only mode
  slideshow_video_url TEXT,
  primary_photo_url TEXT,
  extracted_audio_url TEXT, -- Optional - kept for backward compatibility
  voice_id TEXT, -- Optional - kept for backward compatibility
  avatar_id TEXT, -- Optional - kept for backward compatibility
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================
-- UPDATE EXISTING TABLE (if it exists with old structure)
-- ============================================

-- Make memorial_id nullable if it exists and is NOT NULL
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'heaven_characters' 
    AND column_name = 'memorial_id'
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.heaven_characters 
      ALTER COLUMN memorial_id DROP NOT NULL;
  END IF;
END $$;

-- Change user_id to TEXT if it exists as UUID
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'heaven_characters' 
    AND column_name = 'user_id'
    AND data_type = 'uuid'
  ) THEN
    ALTER TABLE public.heaven_characters 
      ALTER COLUMN user_id TYPE TEXT USING user_id::text;
  END IF;
END $$;

-- Make character_id nullable if it exists and is NOT NULL
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'heaven_characters' 
    AND column_name = 'character_id'
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.heaven_characters 
      ALTER COLUMN character_id DROP NOT NULL;
  END IF;
END $$;

-- ============================================
-- ADD INDEXES FOR VIDEO URL LOOKUPS
-- ============================================

-- Unique index on (user_id, memorial_id) to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_heaven_characters_user_memorial_unique 
  ON public.heaven_characters(user_id, COALESCE(memorial_id::text, 'default'))
  WHERE user_id IS NOT NULL;

-- Index for quick lookups by user_id (including 'default'/'demo' values)
CREATE INDEX IF NOT EXISTS idx_heaven_characters_user_id_text 
  ON public.heaven_characters(user_id) 
  WHERE user_id IS NOT NULL;

-- Index for slideshow_video_url lookups
CREATE INDEX IF NOT EXISTS idx_heaven_characters_video_url 
  ON public.heaven_characters(slideshow_video_url) 
  WHERE slideshow_video_url IS NOT NULL;

-- ============================================
-- CREATE/UPDATE TRIGGER FOR updated_at
-- ============================================

-- Create function if it doesn't exist
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    -- Only update updated_at when data actually changes
    IF row_to_json(OLD) IS DISTINCT FROM row_to_json(NEW) THEN
      NEW.updated_at = now();
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS trg_heaven_characters_updated_at ON public.heaven_characters;
CREATE TRIGGER trg_heaven_characters_updated_at
BEFORE UPDATE ON public.heaven_characters
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.heaven_characters ENABLE ROW LEVEL SECURITY;

-- ============================================
-- UPDATE RLS POLICIES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "heaven_characters_allow_default_read" ON public.heaven_characters;
DROP POLICY IF EXISTS "heaven_characters_allow_default_insert" ON public.heaven_characters;
DROP POLICY IF EXISTS "heaven_characters_allow_default_update" ON public.heaven_characters;
DROP POLICY IF EXISTS "heaven_characters_allow_default_delete" ON public.heaven_characters;
DROP POLICY IF EXISTS "heaven_characters_select_owner_or_collab" ON public.heaven_characters;
DROP POLICY IF EXISTS "Users can insert own heaven_characters" ON public.heaven_characters;
DROP POLICY IF EXISTS "Users can update own heaven_characters" ON public.heaven_characters;
DROP POLICY IF EXISTS "Users can delete own heaven_characters" ON public.heaven_characters;

-- Policy: Allow anyone to read rows with user_id = 'default' or 'demo'
CREATE POLICY "heaven_characters_allow_default_read" 
  ON public.heaven_characters 
  FOR SELECT 
  TO authenticated, anon
  USING (
    user_id IN ('default', 'demo')
    OR (user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' AND user_id::uuid = auth.uid())
    OR (user_id::uuid = auth.uid())
  );

-- Policy: Allow inserting rows with user_id = 'default' or 'demo'
CREATE POLICY "heaven_characters_allow_default_insert" 
  ON public.heaven_characters 
  FOR INSERT 
  TO authenticated, anon
  WITH CHECK (
    user_id IN ('default', 'demo')
    OR (user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' AND user_id::uuid = auth.uid())
    OR (user_id::uuid = auth.uid())
  );

-- Policy: Allow updating rows with user_id = 'default' or 'demo'
CREATE POLICY "heaven_characters_allow_default_update" 
  ON public.heaven_characters 
  FOR UPDATE 
  TO authenticated, anon
  USING (
    user_id IN ('default', 'demo')
    OR (user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' AND user_id::uuid = auth.uid())
    OR (user_id::uuid = auth.uid())
  )
  WITH CHECK (
    user_id IN ('default', 'demo')
    OR (user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' AND user_id::uuid = auth.uid())
    OR (user_id::uuid = auth.uid())
  );

-- Policy: Allow deleting rows with user_id = 'default' or 'demo'
CREATE POLICY "heaven_characters_allow_default_delete" 
  ON public.heaven_characters 
  FOR DELETE 
  TO authenticated, anon
  USING (
    user_id IN ('default', 'demo')
    OR (user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' AND user_id::uuid = auth.uid())
    OR (user_id::uuid = auth.uid())
  );

-- ============================================
-- GRANT PERMISSIONS
-- ============================================
GRANT SELECT, INSERT, UPDATE, DELETE ON public.heaven_characters TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.heaven_characters TO authenticated;

COMMIT;

-- ============================================
-- VERIFICATION
-- ============================================
-- Run this to verify the table was created:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_schema = 'public' 
-- AND table_name = 'heaven_characters'
-- ORDER BY ordinal_position;

