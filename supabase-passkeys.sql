-- Passkey (WebAuthn) tables for Face ID / Touch ID
-- Run in Supabase SQL Editor once

create table if not exists public.user_passkeys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  credential_id text not null,
  public_key text not null,
  counter bigint not null default 0,
  transports text[],
  created_at timestamptz not null default now()
);

create unique index if not exists user_passkeys_credential_id_idx
  on public.user_passkeys (credential_id);

create index if not exists user_passkeys_user_id_idx
  on public.user_passkeys (user_id);

alter table public.user_passkeys disable row level security;

create table if not exists public.passkey_challenges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  type text not null,
  challenge text not null,
  created_at timestamptz not null default now()
);

create index if not exists passkey_challenges_user_id_idx
  on public.passkey_challenges (user_id);

create index if not exists passkey_challenges_type_idx
  on public.passkey_challenges (type);

alter table public.passkey_challenges disable row level security;
