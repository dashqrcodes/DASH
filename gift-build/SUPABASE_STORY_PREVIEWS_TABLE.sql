-- Temporary Story Preview Table
-- Creates records that power the QR preview flow prior to payment

create table if not exists story_previews (
  id uuid default gen_random_uuid() primary key,
  slug text not null,
  person_slug text not null,
  moment_slug text not null,
  person_name text not null,
  story_text text,
  product_type text default 'Timeless Transparency',
  photo_url text not null,
  photo_storage_key text not null,
  video_asset_id text not null,
  status text not null default 'pending', -- pending | claimed | expired
  expires_at timestamptz not null,
  final_slug text,
  final_url text,
  created_at timestamptz default now(),
  claimed_at timestamptz
);

create index if not exists idx_story_previews_status on story_previews(status);
create index if not exists idx_story_previews_expires_at on story_previews(expires_at);
create index if not exists idx_story_previews_slug on story_previews(slug);
create index if not exists idx_story_previews_person_slug on story_previews(person_slug);
create index if not exists idx_story_previews_moment_slug on story_previews(moment_slug);

alter table story_previews enable row level security;

-- Service role (used by Next.js API routes) bypasses RLS automatically.
-- If you want anon reads via the client SDK, add an explicit policy:
-- create policy "public preview access"
--   on story_previews for select
--   using (status = 'pending' and expires_at > now());


