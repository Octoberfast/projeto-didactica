-- Ensure RLS is enabled
alter table public.profiles enable row level security;

-- Drop existing policies to avoid conflicts/duplication
drop policy if exists "Users can view their own profile" on public.profiles;
drop policy if exists "Admins can view all profiles" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;

-- Create policies ensuring SELECT permission is granted
create policy "Users can view their own profile"
  on public.profiles for select
  using ( auth.uid() = id );

create policy "Admins can view all profiles"
  on public.profiles for select
  using ( 
    auth.uid() in (
      select id from public.profiles where role = 'admin'
    )
  );

-- Grant usage on schema and table just in case
grant usage on schema public to anon, authenticated;
grant select on public.profiles to anon, authenticated;
