-- הרצה ב-Supabase: SQL Editor -> New query -> Run.
-- מוסיף שם משתמש, יצירת פרופיל אוטומטית בהרשמה, וכניסה עם שם משתמש.

-- 1. עמודות: שם משתמש ייחודי, וגיל/מגדר/עיסוק לא חובה ברגע ההרשמה
alter table profiles add column if not exists username text;
alter table profiles alter column age drop not null;
alter table profiles alter column gender drop not null;
alter table profiles alter column occupation drop not null;
create unique index if not exists profiles_username_key on profiles (lower(username));

-- 2. בדיקת שם משתמש גם בצד השרת (גיבוי לבדיקה שבאתר)
create or replace function public.username_clean(u text) returns boolean
language sql immutable as $$
  select u ~ '^[A-Za-z0-9_א-ת]{3,20}$'
     and lower(u) !~ '(fuck|shit|bitch|cunt|pussy|asshole|bastard|nigg|slut|whore|nazi|hitler|זונה|שרמוט|מניאק|כוסעמק|כוסאמק|מזדיין)'
     and lower(u) !~ '^(admin|root|support|shutafim|moderator|מנהל|אדמין|תמיכה|שותפים)$';
$$;
alter table profiles drop constraint if exists username_ok;
alter table profiles add constraint username_ok check (username is null or public.username_clean(username));

-- 3. יצירת פרופיל ראשוני אוטומטית כשנרשמים (שם, גיל ושם משתמש מגיעים מטופס ההרשמה)
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare m jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  insert into public.profiles (user_id, first_name, age, username)
  values (new.id, left(coalesce(m->>'first_name', ''), 30), nullif(m->>'age', '')::int, nullif(m->>'username', ''))
  on conflict (user_id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4. האם שם המשתמש פנוי (שמות משתמש ממילא גלויים בפרופילים)
create or replace function public.username_available(p text) returns boolean
language sql security definer stable set search_path = public as $$
  select not exists (select 1 from public.profiles where lower(username) = lower(p));
$$;
grant execute on function public.username_available(text) to anon, authenticated;

-- 5. כניסה עם שם משתמש: מחזיר את האימייל רק אם הסיסמה נכונה, כך שאי אפשר לנחש אימיילים
create or replace function public.email_for_login(p_username text, p_password text) returns text
language plpgsql security definer set search_path = public, auth, extensions as $$
declare v text;
begin
  select u.email into v
  from auth.users u join public.profiles p on p.user_id = u.id
  where lower(p.username) = lower(p_username)
    and u.encrypted_password = crypt(p_password, u.encrypted_password);
  return v;
end $$;
revoke all on function public.email_for_login(text, text) from public;
grant execute on function public.email_for_login(text, text) to anon, authenticated;
