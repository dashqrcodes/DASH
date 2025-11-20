-- ============================================
-- COMPLETE SUPABASE SETUP FOR DASH WEBAPP
-- ============================================
-- Copy everything below and paste into Supabase SQL Editor
-- This sets up ALL tables, indexes, RLS policies, and triggers
-- 
-- IMPROVEMENTS:
-- - Optimized set_updated_at() only updates when data changes
-- - Simplified timestamps (now() instead of timezone('utc', now()))
-- - Composite indexes for common queries
-- - Partial indexes for filtered states (unread notifications)
-- - RLS policies support collaborators
-- - Schema-qualified names (public.) for clarity
-- ============================================

BEGIN;

-- ============================================
-- PREREQUISITES CHECK
-- ============================================
-- Note: We don't use foreign key constraints to auth.users(id) because:
-- 1. Supabase RLS policies handle user ownership security
-- 2. FK constraints to auth schema can cause permission issues
-- 3. auth.users is managed by Supabase Auth system
-- 
-- Instead, we use UUID columns and enforce security via RLS policies using auth.uid()

-- ============================================
-- EXTENSIONS
-- ============================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;
-- Note: uuid-ossp not needed - we use gen_random_uuid() which is built-in

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Auto-update updated_at timestamp (only when data actually changes)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    -- Only update updated_at when data actually changes (not just updated_at touched)
    IF row_to_json(OLD) IS DISTINCT FROM row_to_json(NEW) THEN
      NEW.updated_at = now();
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- ============================================
-- CORE MEMORIAL TABLES
-- ============================================

-- MEMORIALS: Main memorial records
-- Note: user_id references auth.users(id) but no FK constraint (RLS handles security)
CREATE TABLE IF NOT EXISTS public.memorials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, -- References auth.users(id) via RLS, not FK constraint
  loved_one_name TEXT,
  sunrise_date TEXT,
  sunset_date TEXT,
  card_design JSONB,
  poster_design JSONB,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- SLIDESHOW_MEDIA: Media items for slideshows (photos, videos, music)
CREATE TABLE IF NOT EXISTS public.slideshow_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, -- References auth.users(id) via RLS, not FK constraint
  memorial_id UUID NOT NULL REFERENCES public.memorials(id) ON DELETE CASCADE,
  media_items JSONB NOT NULL, -- Array of {url, type, date, preview, muxPlaybackId}
  spotify_playlist JSONB, -- Spotify playlist data
  spotify_tracks JSONB, -- Spotify tracks array
  youtube_track JSONB, -- YouTube Audio Library track
  custom_audio_url TEXT, -- Custom uploaded audio URL
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- HEAVEN_CHARACTERS: HEAVEN AI character data
CREATE TABLE IF NOT EXISTS public.heaven_characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, -- References auth.users(id) via RLS, not FK constraint
  memorial_id UUID NOT NULL REFERENCES public.memorials(id) ON DELETE CASCADE,
  voice_id TEXT,
  avatar_id TEXT,
  character_id TEXT, -- ConvAI character ID
  slideshow_video_url TEXT,
  primary_photo_url TEXT,
  extracted_audio_url TEXT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================
-- CORE FEATURE TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS public.media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID, -- References auth.users(id) via RLS, not FK constraint
  type TEXT CHECK (type IN ('photo', 'video', 'audio')),
  url TEXT NOT NULL,
  description TEXT,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID, -- References auth.users(id) via RLS, not FK constraint
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  transcript TEXT,
  metadata JSONB
);

CREATE TABLE IF NOT EXISTS public.avatars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID, -- References auth.users(id) via RLS, not FK constraint
  photo_url TEXT,
  avatar_id TEXT,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.voices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID, -- References auth.users(id) via RLS, not FK constraint
  audio_url TEXT,
  voice_id TEXT,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.slideshows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID, -- References auth.users(id) via RLS, not FK constraint
  title TEXT,
  description TEXT,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID REFERENCES public.calls(id) ON DELETE CASCADE,
  sender TEXT CHECK (sender IN ('user', 'avatar')),
  text TEXT,
  video_url TEXT,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID, -- References auth.users(id) via RLS, not FK constraint
  display_name TEXT,
  photo_url TEXT,
  bio TEXT,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_type TEXT,
  resource_id UUID,
  user_id UUID, -- References auth.users(id) via RLS, not FK constraint
  role TEXT,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id UUID REFERENCES public.media(id) ON DELETE CASCADE,
  user_id UUID, -- References auth.users(id) via RLS, not FK constraint
  text TEXT,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id UUID REFERENCES public.media(id) ON DELETE CASCADE,
  user_id UUID, -- References auth.users(id) via RLS, not FK constraint
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(media_id, user_id)
);

-- ============================================
-- BUSINESS OPERATIONS TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  address TEXT,
  vendor_type TEXT CHECK (vendor_type IN ('printshop', 'graphic_designer', 'delivery')),
  is_active BOOLEAN DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID, -- References auth.users(id) via RLS, not FK constraint
  order_number TEXT UNIQUE NOT NULL,
  order_type TEXT CHECK (order_type IN ('card', 'poster', 'both')),
  product_type TEXT CHECK (product_type IN ('4x6_card', '20x30_poster')),
  quantity INTEGER DEFAULT 100,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'sent', 'received', 'printing', 'waiting_courier', 'enroute', 'delivered', 'completed')),
  card_design JSONB,
  poster_design JSONB,
  vendor_id UUID REFERENCES public.vendors(id),
  print_shop_email TEXT DEFAULT 'david@dashqrcodes.com',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.pdfs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  pdf_type TEXT CHECK (pdf_type IN ('card_front', 'card_back', 'poster')),
  file_url TEXT NOT NULL,
  file_size INTEGER,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID, -- References auth.users(id) via RLS, not FK constraint
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'canceled', 'refunded')),
  payment_method TEXT,
  metadata JSONB,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  delivery_type TEXT CHECK (delivery_type IN ('uber', 'usps', 'fedex', 'ups', 'custom')),
  tracking_number TEXT,
  courier_name TEXT,
  courier_phone TEXT,
  pickup_location TEXT,
  delivery_location TEXT,
  pickup_address TEXT,
  delivery_address TEXT,
  estimated_pickup_time TIMESTAMP WITH TIME ZONE,
  estimated_delivery_time TIMESTAMP WITH TIME ZONE,
  actual_pickup_time TIMESTAMP WITH TIME ZONE,
  actual_delivery_time TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'picked_up', 'enroute', 'delivered', 'failed')),
  current_location TEXT,
  eta_minutes INTEGER,
  metadata JSONB,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  notes TEXT,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.design_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  revision_number INTEGER DEFAULT 1,
  design_data JSONB NOT NULL,
  approved_by_user_id UUID, -- References auth.users(id) via RLS, not FK constraint
  approved_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID, -- References auth.users(id) via RLS, not FK constraint
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  notification_type TEXT CHECK (notification_type IN ('order_sent', 'order_received', 'printing', 'waiting_courier', 'enroute', 'delivered', 'payment_succeeded', 'payment_failed')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- AI_JOBS: Track background AI processing tasks
CREATE TABLE IF NOT EXISTS public.ai_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID, -- References auth.users(id) via RLS, not FK constraint
  job_type TEXT NOT NULL CHECK (job_type IN ('voice_clone', 'avatar_create', 'audio_extract', 'video_generate', 'image_enhance')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'canceled')),
  input_url TEXT NOT NULL,
  output_url TEXT,
  result_data JSONB,
  error_message TEXT,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  metadata JSONB,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================
-- TRIGGERS FOR updated_at
-- ============================================

DROP TRIGGER IF EXISTS trg_memorials_updated_at ON public.memorials;
CREATE TRIGGER trg_memorials_updated_at
BEFORE UPDATE ON public.memorials
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_slideshow_media_updated_at ON public.slideshow_media;
CREATE TRIGGER trg_slideshow_media_updated_at
BEFORE UPDATE ON public.slideshow_media
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_heaven_characters_updated_at ON public.heaven_characters;
CREATE TRIGGER trg_heaven_characters_updated_at
BEFORE UPDATE ON public.heaven_characters
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_vendors_updated_at ON public.vendors;
CREATE TRIGGER trg_vendors_updated_at
BEFORE UPDATE ON public.vendors
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_orders_updated_at ON public.orders;
CREATE TRIGGER trg_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_payments_updated_at ON public.payments;
CREATE TRIGGER trg_payments_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_deliveries_updated_at ON public.deliveries;
CREATE TRIGGER trg_deliveries_updated_at
BEFORE UPDATE ON public.deliveries
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_ai_jobs_updated_at ON public.ai_jobs;
CREATE TRIGGER trg_ai_jobs_updated_at
BEFORE UPDATE ON public.ai_jobs
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- ============================================
-- INDEXES
-- ============================================
-- Only create indexes if the columns exist (handles partial table creation)

-- Memorial tables
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'memorials' AND column_name = 'user_id') THEN
    CREATE INDEX IF NOT EXISTS idx_memorials_user_id ON public.memorials(user_id);
  END IF;
END $$;

-- Helper function to safely create index only if column exists
CREATE OR REPLACE FUNCTION create_index_if_column_exists(
  p_index_name TEXT,
  p_table_name TEXT,
  p_column_name TEXT,
  p_additional_columns TEXT DEFAULT ''
)
RETURNS void AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns c
    WHERE c.table_schema = 'public' 
    AND c.table_name = p_table_name 
    AND c.column_name = p_column_name
  ) THEN
    EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON public.%I(%I%s)', 
      p_index_name, p_table_name, p_column_name, p_additional_columns);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Memorial tables
SELECT create_index_if_column_exists('idx_slideshow_media_user_id', 'slideshow_media', 'user_id');
SELECT create_index_if_column_exists('idx_slideshow_media_memorial_id', 'slideshow_media', 'memorial_id');
SELECT create_index_if_column_exists('idx_slideshow_media_user_memorial', 'slideshow_media', 'user_id', ', memorial_id');

SELECT create_index_if_column_exists('idx_heaven_characters_user_id', 'heaven_characters', 'user_id');
SELECT create_index_if_column_exists('idx_heaven_characters_memorial_id', 'heaven_characters', 'memorial_id');
SELECT create_index_if_column_exists('idx_heaven_characters_user_memorial', 'heaven_characters', 'user_id', ', memorial_id');

-- Core tables
SELECT create_index_if_column_exists('idx_media_user_id', 'media', 'user_id');
SELECT create_index_if_column_exists('idx_media_type', 'media', 'type');
SELECT create_index_if_column_exists('idx_calls_user_id', 'calls', 'user_id');
SELECT create_index_if_column_exists('idx_avatars_user_id', 'avatars', 'user_id');
SELECT create_index_if_column_exists('idx_voices_user_id', 'voices', 'user_id');
SELECT create_index_if_column_exists('idx_slideshows_user_id', 'slideshows', 'user_id');
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'messages' AND column_name = 'call_id') THEN
    CREATE INDEX IF NOT EXISTS idx_messages_call_id ON public.messages(call_id);
  END IF;
END $$;
SELECT create_index_if_column_exists('idx_profiles_user_id', 'profiles', 'user_id');
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'collaborators' AND column_name = 'resource_type') THEN
    CREATE INDEX IF NOT EXISTS idx_collaborators_resource ON public.collaborators(resource_type, resource_id);
  END IF;
END $$;
SELECT create_index_if_column_exists('idx_collaborators_resource_user', 'collaborators', 'user_id', ', resource_type, resource_id');
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'comments' AND column_name = 'media_id') THEN
    CREATE INDEX IF NOT EXISTS idx_comments_media_id ON public.comments(media_id);
  END IF;
END $$;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'likes' AND column_name = 'media_id') THEN
    CREATE INDEX IF NOT EXISTS idx_likes_media_id ON public.likes(media_id);
  END IF;
END $$;

-- Business tables
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'vendors' AND column_name = 'email') THEN
    CREATE INDEX IF NOT EXISTS idx_vendors_email ON public.vendors(email);
  END IF;
END $$;
SELECT create_index_if_column_exists('idx_orders_user_id', 'orders', 'user_id');
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'order_number') THEN
    CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
  END IF;
END $$;
SELECT create_index_if_column_exists('idx_orders_user_status', 'orders', 'user_id', ', status');
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'pdfs' AND column_name = 'order_id') THEN
    CREATE INDEX IF NOT EXISTS idx_pdfs_order_id ON public.pdfs(order_id);
  END IF;
END $$;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'payments' AND column_name = 'order_id') THEN
    CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
  END IF;
END $$;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'payments' AND column_name = 'stripe_payment_intent_id') THEN
    CREATE INDEX IF NOT EXISTS idx_payments_stripe_payment_intent_id ON public.payments(stripe_payment_intent_id);
  END IF;
END $$;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'deliveries' AND column_name = 'order_id') THEN
    CREATE INDEX IF NOT EXISTS idx_deliveries_order_id ON public.deliveries(order_id);
  END IF;
END $$;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'order_status_history' AND column_name = 'order_id') THEN
    CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON public.order_status_history(order_id);
  END IF;
END $$;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'design_revisions' AND column_name = 'order_id') THEN
    CREATE INDEX IF NOT EXISTS idx_design_revisions_order_id ON public.design_revisions(order_id);
  END IF;
END $$;
SELECT create_index_if_column_exists('idx_notifications_user_id', 'notifications', 'user_id');
-- Partial index for unread notifications (smaller, faster for common query)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'user_id') THEN
    CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id) WHERE is_read = false;
  END IF;
END $$;
SELECT create_index_if_column_exists('idx_ai_jobs_user_id', 'ai_jobs', 'user_id');
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'ai_jobs' AND column_name = 'status') THEN
    CREATE INDEX IF NOT EXISTS idx_ai_jobs_status ON public.ai_jobs(status);
  END IF;
END $$;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'ai_jobs' AND column_name = 'job_type') THEN
    CREATE INDEX IF NOT EXISTS idx_ai_jobs_job_type ON public.ai_jobs(job_type);
  END IF;
END $$;

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.memorials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slideshow_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.heaven_characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avatars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slideshows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdfs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.design_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_jobs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================
-- Drop all existing policies first (idempotent)
DROP POLICY IF EXISTS "memorials_select_owner_or_collab" ON public.memorials;
DROP POLICY IF EXISTS "Users can insert own memorials" ON public.memorials;
DROP POLICY IF EXISTS "Users can update own memorials" ON public.memorials;
DROP POLICY IF EXISTS "Users can delete own memorials" ON public.memorials;
DROP POLICY IF EXISTS "slideshow_media_select_owner_or_collab" ON public.slideshow_media;
DROP POLICY IF EXISTS "Users can insert own slideshow_media" ON public.slideshow_media;
DROP POLICY IF EXISTS "Users can update own slideshow_media" ON public.slideshow_media;
DROP POLICY IF EXISTS "Users can delete own slideshow_media" ON public.slideshow_media;
DROP POLICY IF EXISTS "heaven_characters_select_owner_or_collab" ON public.heaven_characters;
DROP POLICY IF EXISTS "Users can insert own heaven_characters" ON public.heaven_characters;
DROP POLICY IF EXISTS "Users can update own heaven_characters" ON public.heaven_characters;
DROP POLICY IF EXISTS "Users can delete own heaven_characters" ON public.heaven_characters;
DROP POLICY IF EXISTS "Users can read own media" ON public.media;
DROP POLICY IF EXISTS "Users can insert own media" ON public.media;
DROP POLICY IF EXISTS "Users can read own calls" ON public.calls;
DROP POLICY IF EXISTS "Users can insert own calls" ON public.calls;
DROP POLICY IF EXISTS avatars_select_own ON public.avatars;
DROP POLICY IF EXISTS avatars_insert_own ON public.avatars;
DROP POLICY IF EXISTS avatars_update_own ON public.avatars;
DROP POLICY IF EXISTS avatars_delete_own ON public.avatars;
DROP POLICY IF EXISTS avatars_admin ON public.avatars;
DROP POLICY IF EXISTS "Users can read own voices" ON public.voices;
DROP POLICY IF EXISTS "Users can insert own voices" ON public.voices;
DROP POLICY IF EXISTS "Users can update own voices" ON public.voices;
DROP POLICY IF EXISTS "Users can read own slideshows" ON public.slideshows;
DROP POLICY IF EXISTS "Users can insert own slideshows" ON public.slideshows;
DROP POLICY IF EXISTS "Users can update own slideshows" ON public.slideshows;
DROP POLICY IF EXISTS "Users can read own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can insert own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can read collaborators" ON public.collaborators;
DROP POLICY IF EXISTS "Users can insert own collaborators" ON public.collaborators;
DROP POLICY IF EXISTS "Users can read all comments" ON public.comments;
DROP POLICY IF EXISTS "Users can insert own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can read all likes" ON public.likes;
DROP POLICY IF EXISTS "Users can insert own likes" ON public.likes;
DROP POLICY IF EXISTS "Users can delete own likes" ON public.likes;
DROP POLICY IF EXISTS "Users can read vendors" ON public.vendors;
DROP POLICY IF EXISTS "Users can read own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can read own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can read own notifications" ON public.notifications;

-- Memorial tables (using UUID user_id from auth.users)
-- Allow owner or collaborator to read
CREATE POLICY "memorials_select_owner_or_collab" ON public.memorials 
  FOR SELECT TO authenticated 
  USING (
    user_id = (SELECT (auth.uid())::uuid)
    OR EXISTS (
      SELECT 1 FROM public.collaborators c
      WHERE c.resource_type = 'memorial'
        AND c.resource_id = public.memorials.id
        AND c.user_id = (SELECT (auth.uid())::uuid)
    )
  );

CREATE POLICY "Users can insert own memorials" ON public.memorials 
  FOR INSERT TO authenticated 
  WITH CHECK (((SELECT auth.uid())::uuid) = user_id);

CREATE POLICY "Users can update own memorials" ON public.memorials 
  FOR UPDATE TO authenticated 
  USING (((SELECT auth.uid())::uuid) = user_id)
  WITH CHECK (((SELECT auth.uid())::uuid) = user_id);

CREATE POLICY "Users can delete own memorials" ON public.memorials 
  FOR DELETE TO authenticated 
  USING (((SELECT auth.uid())::uuid) = user_id);

-- Allow owner or collaborator (via memorial) to read
CREATE POLICY "slideshow_media_select_owner_or_collab" ON public.slideshow_media 
  FOR SELECT TO authenticated 
  USING (
    user_id = (SELECT (auth.uid())::uuid)
    OR EXISTS (
      SELECT 1 FROM public.memorials m
      JOIN public.collaborators c ON c.resource_type = 'memorial' AND c.resource_id = m.id
      WHERE m.id = public.slideshow_media.memorial_id
        AND c.user_id = (SELECT (auth.uid())::uuid)
    )
  );

CREATE POLICY "Users can insert own slideshow_media" ON public.slideshow_media 
  FOR INSERT TO authenticated 
  WITH CHECK (((SELECT auth.uid())::uuid) = user_id);

CREATE POLICY "Users can update own slideshow_media" ON public.slideshow_media 
  FOR UPDATE TO authenticated 
  USING (((SELECT auth.uid())::uuid) = user_id)
  WITH CHECK (((SELECT auth.uid())::uuid) = user_id);

CREATE POLICY "Users can delete own slideshow_media" ON public.slideshow_media 
  FOR DELETE TO authenticated 
  USING (((SELECT auth.uid())::uuid) = user_id);

-- Allow owner or collaborator (via memorial) to read
CREATE POLICY "heaven_characters_select_owner_or_collab" ON public.heaven_characters 
  FOR SELECT TO authenticated 
  USING (
    user_id = (SELECT (auth.uid())::uuid)
    OR EXISTS (
      SELECT 1 FROM public.memorials m
      JOIN public.collaborators c ON c.resource_type = 'memorial' AND c.resource_id = m.id
      WHERE m.id = public.heaven_characters.memorial_id
        AND c.user_id = (SELECT (auth.uid())::uuid)
    )
  );

CREATE POLICY "Users can insert own heaven_characters" ON public.heaven_characters 
  FOR INSERT TO authenticated 
  WITH CHECK (((SELECT auth.uid())::uuid) = user_id);

CREATE POLICY "Users can update own heaven_characters" ON public.heaven_characters 
  FOR UPDATE TO authenticated 
  USING (((SELECT auth.uid())::uuid) = user_id)
  WITH CHECK (((SELECT auth.uid())::uuid) = user_id);

CREATE POLICY "Users can delete own heaven_characters" ON public.heaven_characters 
  FOR DELETE TO authenticated 
  USING (((SELECT auth.uid())::uuid) = user_id);

-- Core tables (using UUID user_id from auth.users)
CREATE POLICY "Users can read own media" ON public.media 
  FOR SELECT TO authenticated 
  USING (((SELECT auth.uid())::uuid) = user_id);

CREATE POLICY "Users can insert own media" ON public.media 
  FOR INSERT TO authenticated 
  WITH CHECK (((SELECT auth.uid())::uuid) = user_id);

CREATE POLICY "Users can read own calls" ON public.calls 
  FOR SELECT TO authenticated 
  USING (((SELECT auth.uid())::uuid) = user_id);

CREATE POLICY "Users can insert own calls" ON public.calls 
  FOR INSERT TO authenticated 
  WITH CHECK (((SELECT auth.uid())::uuid) = user_id);

-- Permissions for avatars table
REVOKE ALL ON public.avatars FROM PUBLIC;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.avatars TO authenticated;

-- RLS Policies for avatars table
-- Allow authenticated users to SELECT their own avatar
CREATE POLICY avatars_select_own ON public.avatars
  FOR SELECT
  TO authenticated
  USING (((SELECT auth.uid())::uuid) = user_id);

-- Allow authenticated users to INSERT only rows that belong to them
CREATE POLICY avatars_insert_own ON public.avatars
  FOR INSERT
  TO authenticated
  WITH CHECK (((SELECT auth.uid())::uuid) = user_id);

-- Allow authenticated users to UPDATE only their own avatar
CREATE POLICY avatars_update_own ON public.avatars
  FOR UPDATE
  TO authenticated
  USING (((SELECT auth.uid())::uuid) = user_id)
  WITH CHECK (((SELECT auth.uid())::uuid) = user_id);

-- Allow authenticated users to DELETE only their own avatar
CREATE POLICY avatars_delete_own ON public.avatars
  FOR DELETE
  TO authenticated
  USING (((SELECT auth.uid())::uuid) = user_id);

-- Optional: grant full access to admins via a JWT claim
CREATE POLICY avatars_admin ON public.avatars
  FOR ALL
  TO authenticated
  USING ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Users can read own voices" ON public.voices 
  FOR SELECT TO authenticated 
  USING (((SELECT auth.uid())::uuid) = user_id);

CREATE POLICY "Users can insert own voices" ON public.voices 
  FOR INSERT TO authenticated 
  WITH CHECK (((SELECT auth.uid())::uuid) = user_id);

CREATE POLICY "Users can update own voices" ON public.voices 
  FOR UPDATE TO authenticated 
  USING (((SELECT auth.uid())::uuid) = user_id);

CREATE POLICY "Users can read own slideshows" ON public.slideshows 
  FOR SELECT TO authenticated 
  USING (((SELECT auth.uid())::uuid) = user_id);

CREATE POLICY "Users can insert own slideshows" ON public.slideshows 
  FOR INSERT TO authenticated 
  WITH CHECK (((SELECT auth.uid())::uuid) = user_id);

CREATE POLICY "Users can update own slideshows" ON public.slideshows 
  FOR UPDATE TO authenticated 
  USING (((SELECT auth.uid())::uuid) = user_id);

CREATE POLICY "Users can read own messages" ON public.messages 
  FOR SELECT TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM public.calls c 
    WHERE c.id = public.messages.call_id 
    AND c.user_id = ((SELECT auth.uid())::uuid)
  ));

CREATE POLICY "Users can insert own messages" ON public.messages 
  FOR INSERT TO authenticated 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.calls c 
    WHERE c.id = public.messages.call_id 
    AND c.user_id = ((SELECT auth.uid())::uuid)
  ));

CREATE POLICY "Users can read all profiles" ON public.profiles 
  FOR SELECT TO authenticated 
  USING (true);

CREATE POLICY "Users can insert own profile" ON public.profiles 
  FOR INSERT TO authenticated 
  WITH CHECK (((SELECT auth.uid())::uuid) = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles 
  FOR UPDATE TO authenticated 
  USING (((SELECT auth.uid())::uuid) = user_id);

CREATE POLICY "Users can read collaborators" ON public.collaborators 
  FOR SELECT TO authenticated 
  USING (true);

CREATE POLICY "Users can insert own collaborators" ON public.collaborators 
  FOR INSERT TO authenticated 
  WITH CHECK (((SELECT auth.uid())::uuid) = user_id);

CREATE POLICY "Users can read all comments" ON public.comments 
  FOR SELECT TO authenticated 
  USING (true);

CREATE POLICY "Users can insert own comments" ON public.comments 
  FOR INSERT TO authenticated 
  WITH CHECK (((SELECT auth.uid())::uuid) = user_id);

CREATE POLICY "Users can read all likes" ON public.likes 
  FOR SELECT TO authenticated 
  USING (true);

CREATE POLICY "Users can insert own likes" ON public.likes 
  FOR INSERT TO authenticated 
  WITH CHECK (((SELECT auth.uid())::uuid) = user_id);

CREATE POLICY "Users can delete own likes" ON public.likes 
  FOR DELETE TO authenticated 
  USING (((SELECT auth.uid())::uuid) = user_id);

-- Business tables
CREATE POLICY "Users can read vendors" ON public.vendors 
  FOR SELECT TO authenticated 
  USING (true);

CREATE POLICY "Users can read own orders" ON public.orders 
  FOR SELECT TO authenticated 
  USING (((SELECT auth.uid())::uuid) = user_id);

CREATE POLICY "Users can insert own orders" ON public.orders 
  FOR INSERT TO authenticated 
  WITH CHECK (((SELECT auth.uid())::uuid) = user_id);

CREATE POLICY "Users can read own payments" ON public.payments 
  FOR SELECT TO authenticated 
  USING (((SELECT auth.uid())::uuid) = user_id);

CREATE POLICY "Users can read own notifications" ON public.notifications 
  FOR SELECT TO authenticated 
  USING (((SELECT auth.uid())::uuid) = user_id);

-- ============================================
-- INSERT DEFAULT VENDOR
-- ============================================

INSERT INTO public.vendors (name, email, vendor_type, is_active)
VALUES ('B.O. Printing', 'david@dashqrcodes.com', 'printshop', true)
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- DONE!
-- ============================================
-- Next steps:
-- 1. Create storage buckets (see COMPLETE_SUPABASE_SETUP.md)
-- 2. Add environment variables to Vercel
-- 3. Test the connection

-- ============================================
-- DIAGNOSTIC QUERIES (Run these if you get errors)
-- ============================================

-- Check all triggers:
-- SELECT t.tgname, c.relname AS table_name, pg_get_triggerdef(t.oid) AS trigger_def
-- FROM pg_trigger t
-- JOIN pg_class c ON t.tgrelid = c.oid
-- WHERE t.tgname LIKE 'trg_%';

-- Check policies that reference user_id:
-- SELECT schemaname, tablename, policyname, qual, with_check
-- FROM pg_policies
-- WHERE qual LIKE '%user_id%' OR with_check LIKE '%user_id%';

-- Verify table columns:
-- SELECT table_name, column_name, data_type
-- FROM information_schema.columns
-- WHERE table_schema = 'public'
-- AND column_name = 'user_id'
-- ORDER BY table_name;

COMMIT;

