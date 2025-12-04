-- Orders Table for TikTok Gift Funnel
-- Run this in your Supabase SQL Editor

create table if not exists orders (
  id uuid default gen_random_uuid() primary key,
  session_id text not null,
  customer_email text,
  amount_total integer,
  profile_url text,
  video_id text,
  cover_image text,
  block_size text,
  customer_name text,
  customer_message text,
  fulfillment_status text default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Optional: Keep updated_at fresh
drop trigger if exists handle_updated_at on orders;
create trigger handle_updated_at
before update on orders
for each row
execute procedure moddatetime(updated_at);

-- Create index on session_id for faster lookups
create index if not exists idx_orders_session_id on orders(session_id);

-- Create index on fulfillment_status for filtering
create index if not exists idx_orders_fulfillment_status on orders(fulfillment_status);

-- Enable RLS (Row Level Security)
alter table orders enable row level security;

-- Policy: Allow service role to insert/update/select
-- (This is handled by supabaseAdmin which uses service role key)
-- For public access, you might want to add specific policies

-- Policy: Allow authenticated users to view their own orders (optional)
-- create policy "Users can view their own orders"
--   on orders for select
--   using (auth.uid()::text = customer_email);

-- Policy: Allow service role full access (default for supabaseAdmin)
-- Service role key bypasses RLS, so no policy needed for admin operations

