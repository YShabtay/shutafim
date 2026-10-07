-- Admin page: only accounts listed in `admins` can read reports and moderate posts.
-- No Hebrew text here.
create table if not exists admins (user_id uuid primary key references auth.users(id) on delete cascade);
alter table admins enable row level security;
drop policy if exists "admins read self" on admins;
create policy "admins read self" on admins for select using (user_id = auth.uid());

create or replace function public.is_admin() returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from admins where user_id = auth.uid());
$$;
grant execute on function public.is_admin() to authenticated;

drop policy if exists "admins read reports" on reports;
create policy "admins read reports" on reports for select using (public.is_admin());
drop policy if exists "admins update reports" on reports;
create policy "admins update reports" on reports for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins read posts" on posts;
create policy "admins read posts" on posts for select using (public.is_admin());
drop policy if exists "admins update posts" on posts;
create policy "admins update posts" on posts for update using (public.is_admin());
drop policy if exists "admins delete posts" on posts;
create policy "admins delete posts" on posts for delete using (public.is_admin());

-- The first admin is the account whose username is 'yogev'. Change the name below if your username is different.
insert into admins (user_id)
  select user_id from profiles where lower(username) = 'yogev'
  on conflict do nothing;
