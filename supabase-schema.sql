-- DASH Supabase Database Schema
-- Run this in your Supabase SQL Editor: https://urnkszyyabomkpujkzo.supabase.co/project/default/sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Memorials table
CREATE TABLE IF NOT EXISTS memorials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  loved_one_name TEXT NOT NULL,
  sunrise_date DATE,
  sunset_date DATE,
  hero_photo_url TEXT,
  background_url TEXT,
  text_color TEXT DEFAULT '#FFFFFF',
  font_family TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Users table (custom, separate from auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  name TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  memorial_id UUID REFERENCES memorials(id),
  product_type TEXT, -- 'card', 'poster', 'program', 'metal_qr', 'acrylic_57', 'acrylic_66'
  status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'processing', 'shipped', 'completed'
  amount DECIMAL,
  stripe_payment_id TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Slideshows table
CREATE TABLE IF NOT EXISTS slideshows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  memorial_id UUID REFERENCES memorials(id),
  video_url TEXT,
  status TEXT DEFAULT 'processing', -- 'processing', 'ready', 'failed'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Life Chapters table (for life chapters feature)
CREATE TABLE IF NOT EXISTS life_chapters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  memorial_id UUID REFERENCES memorials(id),
  title TEXT,
  content TEXT,
  photo_url TEXT,
  chapter_order INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE memorials ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE slideshows ENABLE ROW LEVEL SECURITY;
ALTER TABLE life_chapters ENABLE ROW LEVEL SECURITY;

-- Basic policies (allow public read/write for now - adjust based on auth needs)
-- For production, you'll want to restrict based on user_id or auth.uid()

-- Memorials: Allow public insert and select (adjust as needed)
CREATE POLICY "Allow public insert on memorials" ON memorials
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public select on memorials" ON memorials
  FOR SELECT USING (true);

CREATE POLICY "Allow public update on memorials" ON memorials
  FOR UPDATE USING (true);

-- Users: Allow public insert and select
CREATE POLICY "Allow public insert on users" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public select on users" ON users
  FOR SELECT USING (true);

-- Orders: Allow public insert and select
CREATE POLICY "Allow public insert on orders" ON orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public select on orders" ON orders
  FOR SELECT USING (true);

-- Slideshows: Allow public insert and select
CREATE POLICY "Allow public insert on slideshows" ON slideshows
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public select on slideshows" ON slideshows
  FOR SELECT USING (true);

-- Life Chapters: Allow public insert and select
CREATE POLICY "Allow public insert on life_chapters" ON life_chapters
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public select on life_chapters" ON life_chapters
  FOR SELECT USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_memorials_created_at ON memorials(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_memorial_id ON orders(memorial_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_slideshows_memorial_id ON slideshows(memorial_id);
CREATE INDEX IF NOT EXISTS idx_life_chapters_memorial_id ON life_chapters(memorial_id);

