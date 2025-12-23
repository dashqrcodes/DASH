-- Permanent stories table - one record per person
create table if not exists stories (
  id uuid default gen_random_uuid() primary key,
  slug text not null unique,
  name text not null,
  story_text text,
  photo_url text,
  mux_asset_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

drop trigger if exists handle_stories_updated_at on stories;
create trigger handle_stories_updated_at
before update on stories
for each row
execute procedure moddatetime(updated_at);

alter table stories enable row level security;

-- Individual product / tribute moments
create table if not exists story_moments (
  id uuid default gen_random_uuid() primary key,
  person_slug text not null,
  slug text not null,
  caption text,
  photo_url text,
  mux_asset_id text,
  product_type text default 'Timeless Transparency',
  created_at timestamptz default now()
);

create unique index if not exists idx_story_moments_person_slug_slug
  on story_moments(person_slug, slug);
create index if not exists idx_story_moments_person_slug
  on story_moments(person_slug);

alter table story_moments enable row level security;

-- Service role bypasses RLS. Add additional policies as needed for anon reads.


