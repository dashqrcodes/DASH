-- Create email OTP table for custom login codes
create table if not exists public.email_otps (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  code_hash text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists email_otps_email_created_at_idx
  on public.email_otps (email, created_at desc);

-- No client-side access needed; keep RLS off for service role usage
alter table public.email_otps disable row level security;
