-- הרצה ב-Supabase: SQL Editor -> New query -> Run.
-- כניסה מיידית: לדירה (המפרסם) ולמחפש (בפרופיל).
alter table posts add column if not exists available_now boolean default false;
alter table profiles add column if not exists move_now boolean default false;
