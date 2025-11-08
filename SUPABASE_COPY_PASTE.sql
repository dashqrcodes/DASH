-- SUPABASE SETUP FOR DASH/HEAVEN + BUSINESS OPERATIONS
-- COMPLETE & FIXED VERSION
-- Copy everything below and paste into Supabase SQL Editor

-- ============================================
-- EXTENSIONS
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$;

-- ============================================
-- CORE TABLES (Media, Calls, Avatars, etc.)
-- ============================================

CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('photo', 'video', 'audio')),
  url TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, NOW())
);

CREATE TABLE IF NOT EXISTS calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  transcript TEXT,
  metadata JSONB
);

CREATE TABLE IF NOT EXISTS avatars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  photo_url TEXT,
  avatar_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, NOW())
);

CREATE TABLE IF NOT EXISTS voices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  audio_url TEXT,
  voice_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, NOW())
);

CREATE TABLE IF NOT EXISTS slideshows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, NOW())
);

CREATE TABLE IF NOT EXISTS slideshow_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slideshow_id UUID REFERENCES slideshows(id) ON DELETE CASCADE,
  media_id UUID REFERENCES media(id) ON DELETE CASCADE,
  position INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, NOW())
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID REFERENCES calls(id) ON DELETE CASCADE,
  sender TEXT CHECK (sender IN ('user', 'avatar')),
  text TEXT,
  video_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, NOW())
);

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  photo_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, NOW())
);

CREATE TABLE IF NOT EXISTS collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_type TEXT,
  resource_id UUID,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, NOW())
);

CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id UUID REFERENCES media(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, NOW())
);

CREATE TABLE IF NOT EXISTS likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id UUID REFERENCES media(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, NOW()),
  UNIQUE(media_id, user_id)
);

-- ============================================
-- BUSINESS OPERATIONS TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  address TEXT,
  vendor_type TEXT CHECK (vendor_type IN ('printshop', 'graphic_designer', 'delivery')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, NOW())
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  order_number TEXT UNIQUE NOT NULL,
  order_type TEXT CHECK (order_type IN ('card', 'poster', 'both')),
  product_type TEXT CHECK (product_type IN ('4x6_card', '20x30_poster')),
  quantity INTEGER DEFAULT 100,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'sent', 'received', 'printing', 'waiting_courier', 'enroute', 'delivered', 'completed')),
  card_design JSONB,
  poster_design JSONB,
  vendor_id UUID REFERENCES vendors(id),
  print_shop_email TEXT DEFAULT 'david@dashqrcodes.com',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, NOW())
);

CREATE TABLE IF NOT EXISTS pdfs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  pdf_type TEXT CHECK (pdf_type IN ('card_front', 'card_back', 'poster')),
  file_url TEXT NOT NULL,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, NOW())
);

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'canceled', 'refunded')),
  payment_method TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, NOW())
);

CREATE TABLE IF NOT EXISTS deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, NOW())
);

CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, NOW())
);

CREATE TABLE IF NOT EXISTS design_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  revision_number INTEGER DEFAULT 1,
  design_data JSONB NOT NULL,
  approved_by_user_id UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, NOW())
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  notification_type TEXT CHECK (notification_type IN ('order_sent', 'order_received', 'printing', 'waiting_courier', 'enroute', 'delivered', 'payment_succeeded', 'payment_failed')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, NOW())
);

-- AI_JOBS: Track background AI processing tasks (voice cloning, avatar generation, etc.)
CREATE TABLE IF NOT EXISTS ai_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  job_type TEXT NOT NULL CHECK (job_type IN ('voice_clone', 'avatar_create', 'audio_extract', 'video_generate', 'image_enhance')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'canceled')),
  input_url TEXT NOT NULL, -- Storage URL of input media
  output_url TEXT, -- Storage URL of result (if applicable)
  result_data JSONB, -- Metadata about the result (voice_id, avatar_id, etc.)
  error_message TEXT,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  metadata JSONB, -- Additional job parameters and context
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, NOW())
);

-- ============================================
-- TRIGGERS FOR updated_at
-- ============================================

CREATE TRIGGER trg_vendors_updated_at
BEFORE UPDATE ON vendors
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_payments_updated_at
BEFORE UPDATE ON payments
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_deliveries_updated_at
BEFORE UPDATE ON deliveries
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_ai_jobs_updated_at
BEFORE UPDATE ON ai_jobs
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_media_user_id ON media(user_id);
CREATE INDEX IF NOT EXISTS idx_media_type ON media(type);
CREATE INDEX IF NOT EXISTS idx_calls_user_id ON calls(user_id);
CREATE INDEX IF NOT EXISTS idx_avatars_user_id ON avatars(user_id);
CREATE INDEX IF NOT EXISTS idx_voices_user_id ON voices(user_id);
CREATE INDEX IF NOT EXISTS idx_slideshows_user_id ON slideshows(user_id);
CREATE INDEX IF NOT EXISTS idx_slideshow_media_slideshow_id ON slideshow_media(slideshow_id);
CREATE INDEX IF NOT EXISTS idx_messages_call_id ON messages(call_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_collaborators_resource ON collaborators(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_comments_media_id ON comments(media_id);
CREATE INDEX IF NOT EXISTS idx_likes_media_id ON likes(media_id);
CREATE INDEX IF NOT EXISTS idx_vendors_email ON vendors(email);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders(user_id, status);
CREATE INDEX IF NOT EXISTS idx_pdfs_order_id ON pdfs(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_payment_intent_id ON payments(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_order_id ON deliveries(order_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_tracking_number ON deliveries(tracking_number);
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_design_revisions_order_id ON design_revisions(order_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_ai_jobs_user_id ON ai_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_jobs_status ON ai_jobs(status);
CREATE INDEX IF NOT EXISTS idx_ai_jobs_job_type ON ai_jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_ai_jobs_user_status ON ai_jobs(user_id, status);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE avatars ENABLE ROW LEVEL SECURITY;
ALTER TABLE voices ENABLE ROW LEVEL SECURITY;
ALTER TABLE slideshows ENABLE ROW LEVEL SECURITY;
ALTER TABLE slideshow_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdfs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_jobs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES (FIXED: auth.uid() wrapped, EXISTS used)
-- ============================================

-- Drop existing policies if they exist (for safe re-runs)
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can read own media" ON media;
  DROP POLICY IF EXISTS "Users can insert own media" ON media;
  DROP POLICY IF EXISTS "Users can update own media" ON media;
  DROP POLICY IF EXISTS "Users can delete own media" ON media;
  DROP POLICY IF EXISTS "Users can read own calls" ON calls;
  DROP POLICY IF EXISTS "Users can insert own calls" ON calls;
  DROP POLICY IF EXISTS "Users can update own calls" ON calls;
  DROP POLICY IF EXISTS "Users can read own avatars" ON avatars;
  DROP POLICY IF EXISTS "Users can insert own avatars" ON avatars;
  DROP POLICY IF EXISTS "Users can update own avatars" ON avatars;
  DROP POLICY IF EXISTS "Users can read own voices" ON voices;
  DROP POLICY IF EXISTS "Users can insert own voices" ON voices;
  DROP POLICY IF EXISTS "Users can update own voices" ON voices;
  DROP POLICY IF EXISTS "Users can read own slideshows" ON slideshows;
  DROP POLICY IF EXISTS "Users can insert own slideshows" ON slideshows;
  DROP POLICY IF EXISTS "Users can update own slideshows" ON slideshows;
  DROP POLICY IF EXISTS "Users can read own slideshow_media" ON slideshow_media;
  DROP POLICY IF EXISTS "Users can insert own slideshow_media" ON slideshow_media;
  DROP POLICY IF EXISTS "Users can read own messages" ON messages;
  DROP POLICY IF EXISTS "Users can insert own messages" ON messages;
  DROP POLICY IF EXISTS "Users can read all profiles" ON profiles;
  DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
  DROP POLICY IF EXISTS "Users can read all comments" ON comments;
  DROP POLICY IF EXISTS "Users can insert own comments" ON comments;
  DROP POLICY IF EXISTS "Users can read all likes" ON likes;
  DROP POLICY IF EXISTS "Users can insert own likes" ON likes;
  DROP POLICY IF EXISTS "Users can delete own likes" ON likes;
  DROP POLICY IF EXISTS "Users can read vendors" ON vendors;
  DROP POLICY IF EXISTS "Users can read own orders" ON orders;
  DROP POLICY IF EXISTS "Users can insert own orders" ON orders;
  DROP POLICY IF EXISTS "Users can update own orders" ON orders;
  DROP POLICY IF EXISTS "Users can read own pdfs" ON pdfs;
  DROP POLICY IF EXISTS "System can insert pdfs" ON pdfs;
  DROP POLICY IF EXISTS "Users can read own payments" ON payments;
  DROP POLICY IF EXISTS "Users can insert own payments" ON payments;
  DROP POLICY IF EXISTS "System can update payments" ON payments;
  DROP POLICY IF EXISTS "Users can read own deliveries" ON deliveries;
  DROP POLICY IF EXISTS "System can manage deliveries" ON deliveries;
  DROP POLICY IF EXISTS "Users can read own order history" ON order_status_history;
  DROP POLICY IF EXISTS "System can insert order history" ON order_status_history;
  DROP POLICY IF EXISTS "Users can read own design revisions" ON design_revisions;
  DROP POLICY IF EXISTS "Users can insert own design revisions" ON design_revisions;
  DROP POLICY IF EXISTS "Users can read own notifications" ON notifications;
  DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
  DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
  DROP POLICY IF EXISTS "Users can read own ai_jobs" ON ai_jobs;
  DROP POLICY IF EXISTS "Users can insert own ai_jobs" ON ai_jobs;
  DROP POLICY IF EXISTS "Users can update own ai_jobs" ON ai_jobs;
  DROP POLICY IF EXISTS "System can update ai_jobs" ON ai_jobs;
END $$;

-- Core policies (fixed: auth.uid() wrapped)
CREATE POLICY "Users can read own media" ON media 
  FOR SELECT TO authenticated 
  USING (((SELECT auth.uid())::uuid) = user_id);

CREATE POLICY "Users can insert own media" ON media 
  FOR INSERT TO authenticated 
  WITH CHECK (((SELECT auth.uid())::uuid) = user_id);

CREATE POLICY "Users can update own media" ON media 
  FOR UPDATE TO authenticated 
  USING (((SELECT auth.uid())::uuid) = user_id);

CREATE POLICY "Users can delete own media" ON media 
  FOR DELETE TO authenticated 
  USING (((SELECT auth.uid())::uuid) = user_id);

CREATE POLICY "Users can read own calls" ON calls 
  FOR SELECT TO authenticated 
  USING (((SELECT auth.uid())::uuid) = user_id);

CREATE POLICY "Users can insert own calls" ON calls 
  FOR INSERT TO authenticated 
  WITH CHECK (((SELECT auth.uid())::uuid) = user_id);

CREATE POLICY "Users can update own calls" ON calls 
  FOR UPDATE TO authenticated 
  USING (((SELECT auth.uid())::uuid) = user_id);

CREATE POLICY "Users can read own avatars" ON avatars 
  FOR SELECT TO authenticated 
  USING (((SELECT auth.uid())::uuid) = user_id);

CREATE POLICY "Users can insert own avatars" ON avatars 
  FOR INSERT TO authenticated 
  WITH CHECK (((SELECT auth.uid())::uuid) = user_id);

CREATE POLICY "Users can update own avatars" ON avatars 
  FOR UPDATE TO authenticated 
  USING (((SELECT auth.uid())::uuid) = user_id);

CREATE POLICY "Users can read own voices" ON voices 
  FOR SELECT TO authenticated 
  USING (((SELECT auth.uid())::uuid) = user_id);

CREATE POLICY "Users can insert own voices" ON voices 
  FOR INSERT TO authenticated 
  WITH CHECK (((SELECT auth.uid())::uuid) = user_id);

CREATE POLICY "Users can update own voices" ON voices 
  FOR UPDATE TO authenticated 
  USING (((SELECT auth.uid())::uuid) = user_id);

CREATE POLICY "Users can read own slideshows" ON slideshows 
  FOR SELECT TO authenticated 
  USING (((SELECT auth.uid())::uuid) = user_id);

CREATE POLICY "Users can insert own slideshows" ON slideshows 
  FOR INSERT TO authenticated 
  WITH CHECK (((SELECT auth.uid())::uuid) = user_id);

CREATE POLICY "Users can update own slideshows" ON slideshows 
  FOR UPDATE TO authenticated 
  USING (((SELECT auth.uid())::uuid) = user_id);

-- Fixed: Using EXISTS instead of IN for better performance
CREATE POLICY "Users can read own slideshow_media" ON slideshow_media 
  FOR SELECT TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM slideshows s 
    WHERE s.id = slideshow_media.slideshow_id 
    AND s.user_id = ((SELECT auth.uid())::uuid)
  ));

CREATE POLICY "Users can insert own slideshow_media" ON slideshow_media 
  FOR INSERT TO authenticated 
  WITH CHECK (EXISTS (
    SELECT 1 FROM slideshows s 
    WHERE s.id = slideshow_media.slideshow_id 
    AND s.user_id = ((SELECT auth.uid())::uuid)
  ));

CREATE POLICY "Users can read own messages" ON messages 
  FOR SELECT TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM calls c 
    WHERE c.id = messages.call_id 
    AND c.user_id = ((SELECT auth.uid())::uuid)
  ));

CREATE POLICY "Users can insert own messages" ON messages 
  FOR INSERT TO authenticated 
  WITH CHECK (EXISTS (
    SELECT 1 FROM calls c 
    WHERE c.id = messages.call_id 
    AND c.user_id = ((SELECT auth.uid())::uuid)
  ));

CREATE POLICY "Users can read all profiles" ON profiles 
  FOR SELECT TO authenticated 
  USING (true);

CREATE POLICY "Users can insert own profile" ON profiles 
  FOR INSERT TO authenticated 
  WITH CHECK (((SELECT auth.uid())::uuid) = user_id);

CREATE POLICY "Users can update own profile" ON profiles 
  FOR UPDATE TO authenticated 
  USING (((SELECT auth.uid())::uuid) = user_id);

CREATE POLICY "Users can read all comments" ON comments 
  FOR SELECT TO authenticated 
  USING (true);

CREATE POLICY "Users can insert own comments" ON comments 
  FOR INSERT TO authenticated 
  WITH CHECK (((SELECT auth.uid())::uuid) = user_id);

CREATE POLICY "Users can read all likes" ON likes 
  FOR SELECT TO authenticated 
  USING (true);

CREATE POLICY "Users can insert own likes" ON likes 
  FOR INSERT TO authenticated 
  WITH CHECK (((SELECT auth.uid())::uuid) = user_id);

CREATE POLICY "Users can delete own likes" ON likes 
  FOR DELETE TO authenticated 
  USING (((SELECT auth.uid())::uuid) = user_id);

-- Business policies
CREATE POLICY "Users can read vendors" ON vendors 
  FOR SELECT TO authenticated 
  USING (true);

CREATE POLICY "Users can read own orders" ON orders 
  FOR SELECT TO authenticated 
  USING (((SELECT auth.uid())::uuid) = user_id);

CREATE POLICY "Users can insert own orders" ON orders 
  FOR INSERT TO authenticated 
  WITH CHECK (((SELECT auth.uid())::uuid) = user_id);

CREATE POLICY "Users can update own orders" ON orders 
  FOR UPDATE TO authenticated 
  USING (((SELECT auth.uid())::uuid) = user_id);

CREATE POLICY "Users can read own pdfs" ON pdfs 
  FOR SELECT TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM orders o 
    WHERE o.id = pdfs.order_id 
    AND o.user_id = ((SELECT auth.uid())::uuid)
  ));

CREATE POLICY "Users can read own payments" ON payments 
  FOR SELECT TO authenticated 
  USING (((SELECT auth.uid())::uuid) = user_id);

CREATE POLICY "Users can insert own payments" ON payments 
  FOR INSERT TO authenticated 
  WITH CHECK (((SELECT auth.uid())::uuid) = user_id);

CREATE POLICY "Users can read own deliveries" ON deliveries 
  FOR SELECT TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM orders o 
    WHERE o.id = deliveries.order_id 
    AND o.user_id = ((SELECT auth.uid())::uuid)
  ));

CREATE POLICY "Users can read own order history" ON order_status_history 
  FOR SELECT TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM orders o 
    WHERE o.id = order_status_history.order_id 
    AND o.user_id = ((SELECT auth.uid())::uuid)
  ));

CREATE POLICY "Users can read own design revisions" ON design_revisions 
  FOR SELECT TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM orders o 
    WHERE o.id = design_revisions.order_id 
    AND o.user_id = ((SELECT auth.uid())::uuid)
  ));

CREATE POLICY "Users can insert own design revisions" ON design_revisions 
  FOR INSERT TO authenticated 
  WITH CHECK (EXISTS (
    SELECT 1 FROM orders o 
    WHERE o.id = design_revisions.order_id 
    AND o.user_id = ((SELECT auth.uid())::uuid)
  ));

CREATE POLICY "Users can read own notifications" ON notifications 
  FOR SELECT TO authenticated 
  USING (((SELECT auth.uid())::uuid) = user_id);

CREATE POLICY "Users can update own notifications" ON notifications 
  FOR UPDATE TO authenticated 
  USING (((SELECT auth.uid())::uuid) = user_id);

-- AI_JOBS policies
CREATE POLICY "Users can read own ai_jobs" ON ai_jobs 
  FOR SELECT TO authenticated 
  USING (((SELECT auth.uid())::uuid) = user_id);

CREATE POLICY "Users can insert own ai_jobs" ON ai_jobs 
  FOR INSERT TO authenticated 
  WITH CHECK (((SELECT auth.uid())::uuid) = user_id);

CREATE POLICY "Users can update own ai_jobs" ON ai_jobs 
  FOR UPDATE TO authenticated 
  USING (((SELECT auth.uid())::uuid) = user_id);

-- Note: Service role bypasses RLS, so background workers can update ai_jobs status
-- If you need authenticated users to update ai_jobs for retries, use:
-- CREATE POLICY "System can update ai_jobs" ON ai_jobs 
--   FOR UPDATE TO authenticated 
--   USING (true);

-- ============================================
-- INSERT DEFAULT VENDOR (FIXED: ON CONFLICT on email)
-- ============================================

INSERT INTO vendors (name, email, vendor_type, is_active)
VALUES ('B.O. Printing', 'david@dashqrcodes.com', 'printshop', true)
ON CONFLICT (email) DO NOTHING;
