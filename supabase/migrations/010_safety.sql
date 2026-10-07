-- Reports and blocking. No Hebrew text here: reasons are stored as keys.
-- reason keys: fake | scam | harassment | inappropriate | other
-- To review reports: Supabase -> Table Editor -> reports (newest first).

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null check (target_type in ('post', 'profile', 'chat')),
  target_id text not null,
  target_user_id uuid references auth.users(id) on delete set null,
  reason text not null,
  details text check (char_length(details) <= 1000),
  status text not null default 'open',
  created_at timestamptz not null default now()
);
alter table reports enable row level security;
drop policy if exists "insert own reports" on reports;
create policy "insert own reports" on reports for insert with check (reporter_id = auth.uid());
drop policy if exists "read own reports" on reports;
create policy "read own reports" on reports for select using (reporter_id = auth.uid());

create table if not exists blocks (
  blocker_id uuid not null references auth.users(id) on delete cascade,
  blocked_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);
alter table blocks enable row level security;
drop policy if exists "read own blocks" on blocks;
create policy "read own blocks" on blocks for select using (blocker_id = auth.uid());
drop policy if exists "block someone" on blocks;
create policy "block someone" on blocks for insert with check (blocker_id = auth.uid());
drop policy if exists "unblock" on blocks;
create policy "unblock" on blocks for delete using (blocker_id = auth.uid());

-- true if either user blocked the other. security definer so the blocked user cannot read the blocks table itself.
create or replace function public.blocked_between(a uuid, b uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from blocks where (blocker_id = a and blocked_id = b) or (blocker_id = b and blocked_id = a));
$$;
grant execute on function public.blocked_between(uuid, uuid) to authenticated;

-- enforcement: no requests, conversations or messages between blocked users
drop policy if exists "apply" on applications;
create policy "apply" on applications for insert with check (
  applicant_id = auth.uid() and status = 'pending' and owner_id <> auth.uid()
  and owner_id = (select p.owner_id from posts p where p.id = post_id)
  and not coalesce((select p.is_sample from posts p where p.id = post_id), false)
  and not public.blocked_between(applicant_id, owner_id)
  and exists (select 1 from profiles pr where pr.user_id = auth.uid()));

drop policy if exists "start conv after accept" on conversations;
create policy "start conv after accept" on conversations for insert
  with check (auth.uid() in (owner_id, seeker_id) and not public.blocked_between(owner_id, seeker_id) and exists (
    select 1 from applications a
     where a.post_id = conversations.post_id
       and a.applicant_id = conversations.seeker_id
       and a.owner_id = conversations.owner_id
       and a.status in ('chatting', 'accepted')));

drop policy if exists "participants send msgs" on messages;
create policy "participants send msgs" on messages for insert
  with check (sender_id = auth.uid() and exists (
    select 1 from conversations c
     where c.id = conversation_id
       and auth.uid() in (c.owner_id, c.seeker_id)
       and not public.blocked_between(c.owner_id, c.seeker_id)));
