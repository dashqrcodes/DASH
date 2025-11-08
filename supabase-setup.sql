-- ============================================
-- SUPABASE DATABASE SETUP FOR DASH/HEAVEN
-- ============================================
-- Run this SQL in Supabase Dashboard → SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- MEDIA: Photos, videos, audio files
CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('photo', 'video', 'audio')),
  url TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- CALLS: Heaven call logs and transcripts
CREATE TABLE IF NOT EXISTS calls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  transcript TEXT,
  metadata JSONB
);

-- AVATARS: AI avatars for users/persons
CREATE TABLE IF NOT EXISTS avatars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  photo_url TEXT,
  avatar_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- VOICES: AI voice clones for users/persons
CREATE TABLE IF NOT EXISTS voices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  audio_url TEXT,
  voice_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- SLIDESHOWS: For organizing media into slideshows
CREATE TABLE IF NOT EXISTS slideshows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- SLIDESHOW_MEDIA: Join table for slideshows and media
CREATE TABLE IF NOT EXISTS slideshow_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slideshow_id UUID REFERENCES slideshows(id) ON DELETE CASCADE,
  media_id UUID REFERENCES media(id) ON DELETE CASCADE,
  position INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- MESSAGES: For chat/transcript in calls
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  call_id UUID REFERENCES calls(id) ON DELETE CASCADE,
  sender TEXT CHECK (sender IN ('user', 'avatar')),
  text TEXT,
  video_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- PROFILES: User profile info (optional, for display)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  photo_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- COLLABORATORS: For shared/collaborative editing
CREATE TABLE IF NOT EXISTS collaborators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource_type TEXT, -- e.g. 'slideshow', 'call'
  resource_id UUID,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT, -- e.g. 'editor', 'viewer'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- COMMENTS: For social features
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  media_id UUID REFERENCES media(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- LIKES: For social features
CREATE TABLE IF NOT EXISTS likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  media_id UUID REFERENCES media(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(media_id, user_id)
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_media_user_id ON media(user_id);
CREATE INDEX IF NOT EXISTS idx_media_type ON media(type);
CREATE INDEX IF NOT EXISTS idx_media_created_at ON media(created_at);

CREATE INDEX IF NOT EXISTS idx_calls_user_id ON calls(user_id);
CREATE INDEX IF NOT EXISTS idx_calls_started_at ON calls(started_at);

CREATE INDEX IF NOT EXISTS idx_avatars_user_id ON avatars(user_id);
CREATE INDEX IF NOT EXISTS idx_voices_user_id ON voices(user_id);

CREATE INDEX IF NOT EXISTS idx_slideshows_user_id ON slideshows(user_id);
CREATE INDEX IF NOT EXISTS idx_slideshow_media_slideshow_id ON slideshow_media(slideshow_id);
CREATE INDEX IF NOT EXISTS idx_slideshow_media_media_id ON slideshow_media(media_id);
CREATE INDEX IF NOT EXISTS idx_slideshow_media_position ON slideshow_media(position);

CREATE INDEX IF NOT EXISTS idx_messages_call_id ON messages(call_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

CREATE INDEX IF NOT EXISTS idx_collaborators_resource ON collaborators(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_collaborators_user_id ON collaborators(user_id);

CREATE INDEX IF NOT EXISTS idx_comments_media_id ON comments(media_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);

CREATE INDEX IF NOT EXISTS idx_likes_media_id ON likes(media_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);

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

-- ============================================
-- RLS POLICIES
-- ============================================

-- MEDIA POLICIES
CREATE POLICY "Users can read own media" ON media FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own media" ON media FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own media" ON media FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own media" ON media FOR DELETE USING (auth.uid() = user_id);

-- CALLS POLICIES
CREATE POLICY "Users can read own calls" ON calls FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own calls" ON calls FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own calls" ON calls FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own calls" ON calls FOR DELETE USING (auth.uid() = user_id);

-- AVATARS POLICIES
CREATE POLICY "Users can read own avatars" ON avatars FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own avatars" ON avatars FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own avatars" ON avatars FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own avatars" ON avatars FOR DELETE USING (auth.uid() = user_id);

-- VOICES POLICIES
CREATE POLICY "Users can read own voices" ON voices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own voices" ON voices FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own voices" ON voices FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own voices" ON voices FOR DELETE USING (auth.uid() = user_id);

-- SLIDESHOWS POLICIES
CREATE POLICY "Users can read own slideshows" ON slideshows FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own slideshows" ON slideshows FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own slideshows" ON slideshows FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own slideshows" ON slideshows FOR DELETE USING (auth.uid() = user_id);

-- SLIDESHOW_MEDIA POLICIES
CREATE POLICY "Users can read own slideshow_media" ON slideshow_media FOR SELECT 
  USING (auth.uid() IN (SELECT user_id FROM slideshows WHERE id = slideshow_media.slideshow_id));
CREATE POLICY "Users can insert own slideshow_media" ON slideshow_media FOR INSERT 
  WITH CHECK (auth.uid() IN (SELECT user_id FROM slideshows WHERE id = slideshow_media.slideshow_id));
CREATE POLICY "Users can update own slideshow_media" ON slideshow_media FOR UPDATE 
  USING (auth.uid() IN (SELECT user_id FROM slideshows WHERE id = slideshow_media.slideshow_id));
CREATE POLICY "Users can delete own slideshow_media" ON slideshow_media FOR DELETE 
  USING (auth.uid() IN (SELECT user_id FROM slideshows WHERE id = slideshow_media.slideshow_id));

-- MESSAGES POLICIES
CREATE POLICY "Users can read own messages" ON messages FOR SELECT 
  USING (auth.uid() IN (SELECT user_id FROM calls WHERE id = messages.call_id));
CREATE POLICY "Users can insert own messages" ON messages FOR INSERT 
  WITH CHECK (auth.uid() IN (SELECT user_id FROM calls WHERE id = messages.call_id));
CREATE POLICY "Users can update own messages" ON messages FOR UPDATE 
  USING (auth.uid() IN (SELECT user_id FROM calls WHERE id = messages.call_id));
CREATE POLICY "Users can delete own messages" ON messages FOR DELETE 
  USING (auth.uid() IN (SELECT user_id FROM calls WHERE id = messages.call_id));

-- PROFILES POLICIES
CREATE POLICY "Users can read all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own profile" ON profiles FOR DELETE USING (auth.uid() = user_id);

-- COLLABORATORS POLICIES
CREATE POLICY "Users can read collaborators" ON collaborators FOR SELECT USING (true);
CREATE POLICY "Users can insert collaborators" ON collaborators FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own collaborators" ON collaborators FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own collaborators" ON collaborators FOR DELETE USING (auth.uid() = user_id);

-- COMMENTS POLICIES
CREATE POLICY "Users can read all comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Users can insert own comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid() = user_id);

-- LIKES POLICIES
CREATE POLICY "Users can read all likes" ON likes FOR SELECT USING (true);
CREATE POLICY "Users can insert own likes" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own likes" ON likes FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- DONE! 
-- ============================================
-- Next: Create 'heaven-assets' storage bucket in Supabase Dashboard
-- Storage → New Bucket → Name: 'heaven-assets' → Public bucket: ✅
