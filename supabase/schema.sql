-- הריצו ב-Supabase: SQL Editor -> New query -> Run

create table posts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  city text not null,
  neighborhood text,
  rent int not null,
  available_from date,
  roommates_total int default 2,   -- כמה דיירים בדירה (כולל המחפש)
  description text,
  photos text[] default '{}',
  pref_gender text default 'any',  -- any | male | female
  pref_age_min int,
  pref_age_max int,
  pref_smoking text default 'any', -- any | no | yes
  pref_pets text default 'any',    -- any | no | yes
  pref_kosher boolean default false,
  pref_occupation text default 'any', -- any | student | working
  roommates jsonb default '[]',    -- דיירים קיימים: [{name, age, occupation}]
  status text default 'active',    -- active | taken
  created_at timestamptz default now()
);

-- קישור לרשת חברתית (אופציונלי), גלוי רק למשתמשים מחוברים
create table post_contacts (
  post_id uuid primary key references posts(id) on delete cascade,
  social text
);

-- פרופילים: אין בהם טלפון או מייל, גלויים למשתמשים מחוברים בלבד
create table profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null,
  age int not null check (age between 18 and 99),
  gender text not null,            -- male | female | other
  occupation text not null,        -- student | working
  smoking text default 'no',       -- no | yes
  has_pet boolean default false,
  cleanliness text default 'normal', -- relaxed | normal | tidy
  sleep text default 'flexible',   -- early | flexible | night
  guests text default 'sometimes', -- rare | sometimes | often
  kosher boolean default false,
  bio text check (char_length(bio) <= 400),
  photo text,
  budget int,
  move_date date,
  updated_at timestamptz default now()
);
alter table profiles enable row level security;
create policy "logged in read profiles" on profiles for select using (auth.uid() is not null);
create policy "insert own profile" on profiles for insert with check (user_id = auth.uid());
create policy "update own profile" on profiles for update using (user_id = auth.uid());

-- בקשות הצטרפות לדירה
create table applications (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  applicant_id uuid not null references auth.users(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  message text check (char_length(message) <= 600),
  status text default 'pending',   -- pending | accepted | declined | withdrawn
  created_at timestamptz default now(),
  unique (post_id, applicant_id)
);
alter table applications enable row level security;
create policy "participants read apps" on applications for select using (auth.uid() in (applicant_id, owner_id));
create policy "apply" on applications for insert with check (
  applicant_id = auth.uid() and status = 'pending' and owner_id <> auth.uid()
  and owner_id = (select p.owner_id from posts p where p.id = post_id)
  and exists (select 1 from profiles pr where pr.user_id = auth.uid()));
create policy "owner decides" on applications for update using (owner_id = auth.uid()) with check (status in ('accepted','declined'));
create policy "applicant withdraws" on applications for update using (applicant_id = auth.uid()) with check (status = 'withdrawn');

-- צ'אט פנימי: שיחה אחת לכל זוג (פוסט, מתעניין)
create table conversations (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  seeker_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  unique (post_id, seeker_id)
);
create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz default now()
);
alter table conversations enable row level security;
alter table messages enable row level security;
alter publication supabase_realtime add table messages;

create policy "participants read convs" on conversations for select
  using (auth.uid() in (owner_id, seeker_id));
-- שיחה נפתחת רק אחרי שבקשה אושרה
create policy "start conv after accept" on conversations for insert
  with check (auth.uid() in (owner_id, seeker_id) and exists (
    select 1 from applications a where a.post_id = conversations.post_id
      and a.applicant_id = conversations.seeker_id and a.owner_id = conversations.owner_id and a.status = 'accepted'));
create policy "participants read msgs" on messages for select
  using (exists (select 1 from conversations c where c.id = conversation_id and auth.uid() in (c.owner_id, c.seeker_id)));
create policy "participants send msgs" on messages for insert
  with check (sender_id = auth.uid() and exists (select 1 from conversations c where c.id = conversation_id and auth.uid() in (c.owner_id, c.seeker_id)));

alter table posts enable row level security;
alter table post_contacts enable row level security;

create policy "read active posts" on posts for select using (status = 'active' or owner_id = auth.uid());
create policy "insert own posts" on posts for insert with check (owner_id = auth.uid());
create policy "update own posts" on posts for update using (owner_id = auth.uid());
create policy "delete own posts" on posts for delete using (owner_id = auth.uid());

create policy "logged in read contacts" on post_contacts for select using (auth.uid() is not null);
create policy "owner insert contact" on post_contacts for insert
  with check (exists (select 1 from posts p where p.id = post_id and p.owner_id = auth.uid()));
create policy "owner update contact" on post_contacts for update
  using (exists (select 1 from posts p where p.id = post_id and p.owner_id = auth.uid()));

-- תמונות
insert into storage.buckets (id, name, public) values ('photos', 'photos', true) on conflict do nothing;
create policy "public read photos" on storage.objects for select using (bucket_id = 'photos');
create policy "auth upload photos" on storage.objects for insert
  with check (bucket_id = 'photos' and auth.uid() is not null);
