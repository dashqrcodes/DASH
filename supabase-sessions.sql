create table if not exists public.user_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  email text,
  token_hash text not null,
  user_agent text,
  created_at timestamp with time zone default now(),
  last_seen_at timestamp with time zone default now(),
  expires_at timestamp with time zone not null
);

create index if not exists user_sessions_token_idx on public.user_sessions(token_hash);
create index if not exists user_sessions_user_idx on public.user_sessions(user_id);

alter table public.user_sessions disable row level security;
