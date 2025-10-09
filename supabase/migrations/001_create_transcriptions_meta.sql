-- 001_create_transcriptions_meta.sql
-- Idempotent migration: create base table, enable RLS, and basic policies and indexes

begin;

-- Ensure pgcrypto is available for gen_random_uuid
create extension if not exists pgcrypto;

create table if not exists public.transcriptions_meta (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  empresa text not null,
  projeto text not null,
  storage_path text not null,
  file_name text not null,
  size bigint not null,
  mime_type text not null,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.transcriptions_meta enable row level security;

-- Drop policies if they already exist (idempotency)
drop policy if exists "Allow insert own" on public.transcriptions_meta;
drop policy if exists "Allow select own" on public.transcriptions_meta;

-- Only allow authenticated users to insert/select their own rows
create policy "Allow insert own"
  on public.transcriptions_meta
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Allow select own"
  on public.transcriptions_meta
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Indexes for performance
create index if not exists transcriptions_meta_user_id_idx on public.transcriptions_meta(user_id);
create index if not exists transcriptions_meta_created_at_idx on public.transcriptions_meta(created_at desc);

commit;