-- התראות באתר: בקשה חדשה, בקשה שאושרה/נדחתה, הודעה חדשה בצ'אט.
-- נוצרות אוטומטית על ידי טריגרים. אין כאן טקסט בעברית: הניסוח נעשה באתר.

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,                        -- application | accepted | declined | message
  post_id uuid references posts(id) on delete cascade,
  conversation_id uuid references conversations(id) on delete cascade,
  post_title text,
  actor_name text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx on notifications (user_id, read, created_at desc);

alter table notifications enable row level security;
drop policy if exists "read own notifications" on notifications;
create policy "read own notifications" on notifications for select using (user_id = auth.uid());
drop policy if exists "update own notifications" on notifications;
create policy "update own notifications" on notifications for update using (user_id = auth.uid()) with check (user_id = auth.uid());

do $$ begin
  alter publication supabase_realtime add table notifications;
exception when duplicate_object then null; end $$;

-- בקשה חדשה: התראה לבעל הדירה
create or replace function public.notify_application() returns trigger
language plpgsql security definer set search_path = public as $$
declare t text; n text;
begin
  select title into t from posts where id = new.post_id;
  select first_name into n from profiles where user_id = new.applicant_id;
  insert into notifications (user_id, kind, post_id, post_title, actor_name)
  values (new.owner_id, 'application', new.post_id, t, n);
  return new;
end $$;
drop trigger if exists on_application_created on applications;
create trigger on_application_created after insert on applications
  for each row execute function public.notify_application();

-- בקשה אושרה או נדחתה: התראה למבקש
create or replace function public.notify_application_decision() returns trigger
language plpgsql security definer set search_path = public as $$
declare t text; n text;
begin
  select title into t from posts where id = new.post_id;
  select first_name into n from profiles where user_id = new.owner_id;
  insert into notifications (user_id, kind, post_id, post_title, actor_name)
  values (new.applicant_id, new.status, new.post_id, t, n);
  return new;
end $$;
drop trigger if exists on_application_decided on applications;
create trigger on_application_decided after update of status on applications
  for each row when (old.status is distinct from new.status and new.status in ('accepted', 'declined'))
  execute function public.notify_application_decision();

-- הודעה חדשה בצ'אט: התראה אחת לא נקראת לכל שיחה (מתעדכנת במקום להצטבר)
create or replace function public.notify_message() returns trigger
language plpgsql security definer set search_path = public as $$
declare c conversations%rowtype; r uuid; n text;
begin
  select * into c from conversations where id = new.conversation_id;
  r := case when new.sender_id = c.owner_id then c.seeker_id else c.owner_id end;
  select first_name into n from profiles where user_id = new.sender_id;
  update notifications set created_at = now(), actor_name = n
   where user_id = r and kind = 'message' and conversation_id = c.id and read = false;
  if not found then
    insert into notifications (user_id, kind, conversation_id, post_id, actor_name)
    values (r, 'message', c.id, c.post_id, n);
  end if;
  return new;
end $$;
drop trigger if exists on_message_created on messages;
create trigger on_message_created after insert on messages
  for each row execute function public.notify_message();
