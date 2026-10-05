-- דירות לדוגמה: מפרסמים ודירות מסומנים is_sample כדי שהאתר לא ייראה ריק.
-- הסרה מלאה: supabase/remove_samples.sql
alter table posts add column if not exists is_sample boolean default false;

-- אי אפשר להגיש בקשה לדירה לדוגמה
drop policy if exists "apply" on applications;
create policy "apply" on applications for insert with check (
  applicant_id = auth.uid() and status = 'pending' and owner_id <> auth.uid()
  and owner_id = (select p.owner_id from posts p where p.id = post_id)
  and not coalesce((select p.is_sample from posts p where p.id = post_id), false)
  and exists (select 1 from profiles pr where pr.user_id = auth.uid()));

-- נועה (תל אביב)
insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, banned_until, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'sample1@sample.invalid', null, now(), '2999-01-01', '{"provider":"email"}', '{"first_name": "נועה", "age": 28}'::jsonb, now(), now(), '', '', '', '')
on conflict (id) do nothing;
insert into profiles (user_id, first_name, age, gender, occupation, smoking, has_pet, cleanliness, sleep, guests, kosher, bio)
values ('a0000000-0000-4000-8000-000000000001', 'נועה', 28, 'female', 'working', 'no', false, 'tidy', 'flexible', 'sometimes', false, 'מעצבת גרפית, אוהבת בישולים וערבים רגועים בבית.')
on conflict (user_id) do update set first_name=excluded.first_name, age=excluded.age, gender=excluded.gender, occupation=excluded.occupation, smoking=excluded.smoking, has_pet=excluded.has_pet, cleanliness=excluded.cleanliness, sleep=excluded.sleep, guests=excluded.guests, kosher=excluded.kosher, bio=excluded.bio;
insert into posts (id, owner_id, title, city, neighborhood, rent, available_from, available_now, roommates_total, description, photos, pref_gender, pref_age_min, pref_age_max, pref_smoking, pref_pets, pref_kosher, pref_occupation, roommates, is_sample, created_at)
values ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'חדר מרווח בדירת 3 חדרים בפלורנטין', 'תל אביב', 'פלורנטין', 3200, '2026-11-01', false, 3, 'דירה מוארת עם מרפסת, קרובה לברים ולתחבורה. מחפשים שותף שקט ואחראי.',
  array['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=75', 'https://images.unsplash.com/photo-1499916078039-922301b0eb9b?auto=format&fit=crop&w=1000&q=75', 'https://images.unsplash.com/photo-1630699144641-72fa7a6b8aa1?auto=format&fit=crop&w=1000&q=75']::text[], 'any', 24, 32, 'no', 'any', false, 'working',
  '[{"name": "נועה", "age": 28, "occupation": "מעצבת גרפית"}, {"name": "גיל", "age": 30, "occupation": "מהנדס"}]'::jsonb, true, now() - interval '1 hours')
on conflict (id) do nothing;

-- מאיה (ירושלים)
insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, banned_until, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-4000-8000-000000000002', 'authenticated', 'authenticated', 'sample2@sample.invalid', null, now(), '2999-01-01', '{"provider":"email"}', '{"first_name": "מאיה", "age": 24}'::jsonb, now(), now(), '', '', '', '')
on conflict (id) do nothing;
insert into profiles (user_id, first_name, age, gender, occupation, smoking, has_pet, cleanliness, sleep, guests, kosher, bio)
values ('a0000000-0000-4000-8000-000000000002', 'מאיה', 24, 'female', 'student', 'no', false, 'normal', 'night', 'often', true, 'לומדת פסיכולוגיה, חברותית ואוהבת לארח.')
on conflict (user_id) do update set first_name=excluded.first_name, age=excluded.age, gender=excluded.gender, occupation=excluded.occupation, smoking=excluded.smoking, has_pet=excluded.has_pet, cleanliness=excluded.cleanliness, sleep=excluded.sleep, guests=excluded.guests, kosher=excluded.kosher, bio=excluded.bio;
insert into posts (id, owner_id, title, city, neighborhood, rent, available_from, available_now, roommates_total, description, photos, pref_gender, pref_age_min, pref_age_max, pref_smoking, pref_pets, pref_kosher, pref_occupation, roommates, is_sample, created_at)
values ('b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000002', 'שותפה לדירה ליד האוניברסיטה', 'ירושלים', 'גבעת רם', 1900, '2026-10-20', false, 4, 'דירת סטודנטיות חמה, שבע דקות הליכה לקמפוס. אווירה טובה ומטבח משותף.',
  array['https://images.unsplash.com/photo-1552558636-f6a8f071c2b3?auto=format&fit=crop&w=1000&q=75', 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=1000&q=75', 'https://images.unsplash.com/photo-1630699376167-3870469e7598?auto=format&fit=crop&w=1000&q=75']::text[], 'female', 20, 28, 'no', 'no', true, 'student',
  '[{"name": "מאיה", "age": 24, "occupation": "סטודנטית לפסיכולוגיה"}, {"name": "שירה", "age": 23, "occupation": "סטודנטית לביולוגיה"}, {"name": "יעל", "age": 25, "occupation": "סטודנטית למשפטים"}]'::jsonb, true, now() - interval '2 hours')
on conflict (id) do nothing;

-- עידו (חיפה)
insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, banned_until, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-4000-8000-000000000003', 'authenticated', 'authenticated', 'sample3@sample.invalid', null, now(), '2999-01-01', '{"provider":"email"}', '{"first_name": "עידו", "age": 31}'::jsonb, now(), now(), '', '', '', '')
on conflict (id) do nothing;
insert into profiles (user_id, first_name, age, gender, occupation, smoking, has_pet, cleanliness, sleep, guests, kosher, bio)
values ('a0000000-0000-4000-8000-000000000003', 'עידו', 31, 'male', 'working', 'no', true, 'normal', 'flexible', 'sometimes', false, 'מפתח תוכנה, עובד הרבה מהבית. חתול אחד, לא מזיק.')
on conflict (user_id) do update set first_name=excluded.first_name, age=excluded.age, gender=excluded.gender, occupation=excluded.occupation, smoking=excluded.smoking, has_pet=excluded.has_pet, cleanliness=excluded.cleanliness, sleep=excluded.sleep, guests=excluded.guests, kosher=excluded.kosher, bio=excluded.bio;
insert into posts (id, owner_id, title, city, neighborhood, rent, available_from, available_now, roommates_total, description, photos, pref_gender, pref_age_min, pref_age_max, pref_smoking, pref_pets, pref_kosher, pref_occupation, roommates, is_sample, created_at)
values ('b0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000003', 'חדר בדירה שקטה עם מרפסת גדולה', 'חיפה', 'הדר', 2100, '2026-11-15', false, 2, 'דירה רגועה עם נוף, מתאימה למי שעובד מהבית. אוהבים בישולים משותפים.',
  array['https://images.unsplash.com/photo-1600494448850-6013c64ba722?auto=format&fit=crop&w=1000&q=75', 'https://images.unsplash.com/photo-1612152605347-f93296cb657d?auto=format&fit=crop&w=1000&q=75', 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=75']::text[], 'any', 25, 38, 'no', 'yes', false, 'working',
  '[{"name": "עידו", "age": 31, "occupation": "מפתח תוכנה"}]'::jsonb, true, now() - interval '3 hours')
on conflict (id) do nothing;

-- טל (באר שבע)
insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, banned_until, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-4000-8000-000000000004', 'authenticated', 'authenticated', 'sample4@sample.invalid', null, now(), '2999-01-01', '{"provider":"email"}', '{"first_name": "טל", "age": 23}'::jsonb, now(), now(), '', '', '', '')
on conflict (id) do nothing;
insert into profiles (user_id, first_name, age, gender, occupation, smoking, has_pet, cleanliness, sleep, guests, kosher, bio)
values ('a0000000-0000-4000-8000-000000000004', 'טל', 23, 'male', 'student', 'no', false, 'normal', 'flexible', 'often', false, 'סטודנט להנדסה, אוהב כדורגל ומשחקי קופסה.')
on conflict (user_id) do update set first_name=excluded.first_name, age=excluded.age, gender=excluded.gender, occupation=excluded.occupation, smoking=excluded.smoking, has_pet=excluded.has_pet, cleanliness=excluded.cleanliness, sleep=excluded.sleep, guests=excluded.guests, kosher=excluded.kosher, bio=excluded.bio;
insert into posts (id, owner_id, title, city, neighborhood, rent, available_from, available_now, roommates_total, description, photos, pref_gender, pref_age_min, pref_age_max, pref_smoking, pref_pets, pref_kosher, pref_occupation, roommates, is_sample, created_at)
values ('b0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000004', 'חדר בדירת סטודנטים, קרוב לאוניברסיטה', 'באר שבע', 'שכונה ד׳', 1300, '2026-10-25', false, 4, 'דירה גדולה ומשופצת עם שלושה שותפים חברותיים.',
  array['https://images.unsplash.com/photo-1631048501831-46856f9eaaf2?auto=format&fit=crop&w=1000&q=75', 'https://images.unsplash.com/photo-1632119289059-793dd347950f?auto=format&fit=crop&w=1000&q=75', 'https://images.unsplash.com/photo-1759691337957-ebc9ed54dc44?auto=format&fit=crop&w=1000&q=75']::text[], 'any', 20, 30, 'any', 'any', false, 'student',
  '[{"name": "טל", "age": 23, "occupation": "סטודנט להנדסה"}, {"name": "אורי", "age": 24, "occupation": "סטודנט לכלכלה"}, {"name": "נדב", "age": 22, "occupation": "סטודנט למדעי המחשב"}]'::jsonb, true, now() - interval '4 hours')
on conflict (id) do nothing;

-- ליאור (רמת גן)
insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, banned_until, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-4000-8000-000000000005', 'authenticated', 'authenticated', 'sample5@sample.invalid', null, now(), '2999-01-01', '{"provider":"email"}', '{"first_name": "ליאור", "age": 30}'::jsonb, now(), now(), '', '', '', '')
on conflict (id) do nothing;
insert into profiles (user_id, first_name, age, gender, occupation, smoking, has_pet, cleanliness, sleep, guests, kosher, bio)
values ('a0000000-0000-4000-8000-000000000005', 'ליאור', 30, 'female', 'working', 'no', false, 'tidy', 'early', 'sometimes', false, 'רופאת שיניים, קמה מוקדם ומחפשת שקט.')
on conflict (user_id) do update set first_name=excluded.first_name, age=excluded.age, gender=excluded.gender, occupation=excluded.occupation, smoking=excluded.smoking, has_pet=excluded.has_pet, cleanliness=excluded.cleanliness, sleep=excluded.sleep, guests=excluded.guests, kosher=excluded.kosher, bio=excluded.bio;
insert into posts (id, owner_id, title, city, neighborhood, rent, available_from, available_now, roommates_total, description, photos, pref_gender, pref_age_min, pref_age_max, pref_smoking, pref_pets, pref_kosher, pref_occupation, roommates, is_sample, created_at)
values ('b0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000005', 'שותפה לדירה מעוצבת ליד הרכבת', 'רמת גן', 'בורסה', 2900, '2026-12-01', false, 2, 'דירת 3 חדרים מעוצבת, חמש דקות מהרכבת. מחפשת שותפה מסודרת ופתוחה.',
  array['https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=1000&q=75', 'https://images.unsplash.com/photo-1617099443741-a9b51eabd2b8?auto=format&fit=crop&w=1000&q=75', 'https://images.unsplash.com/photo-1755624222023-621f7718950b?auto=format&fit=crop&w=1000&q=75']::text[], 'female', 26, 35, 'no', 'no', false, 'working',
  '[{"name": "ליאור", "age": 30, "occupation": "רופאת שיניים"}]'::jsonb, true, now() - interval '5 hours')
on conflict (id) do nothing;

-- אורי (הרצליה)
insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, banned_until, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-4000-8000-000000000006', 'authenticated', 'authenticated', 'sample6@sample.invalid', null, now(), '2999-01-01', '{"provider":"email"}', '{"first_name": "אורי", "age": 26}'::jsonb, now(), now(), '', '', '', '')
on conflict (id) do nothing;
insert into profiles (user_id, first_name, age, gender, occupation, smoking, has_pet, cleanliness, sleep, guests, kosher, bio)
values ('a0000000-0000-4000-8000-000000000006', 'אורי', 26, 'male', 'working', 'no', false, 'normal', 'flexible', 'sometimes', false, 'עובד בהייטק, אוהב ריצה בבוקר ובישול בסופי שבוע.')
on conflict (user_id) do update set first_name=excluded.first_name, age=excluded.age, gender=excluded.gender, occupation=excluded.occupation, smoking=excluded.smoking, has_pet=excluded.has_pet, cleanliness=excluded.cleanliness, sleep=excluded.sleep, guests=excluded.guests, kosher=excluded.kosher, bio=excluded.bio;
insert into posts (id, owner_id, title, city, neighborhood, rent, available_from, available_now, roommates_total, description, photos, pref_gender, pref_age_min, pref_age_max, pref_smoking, pref_pets, pref_kosher, pref_occupation, roommates, is_sample, created_at)
values ('b0000000-0000-4000-8000-000000000006', 'a0000000-0000-4000-8000-000000000006', 'חדר בדירת גג עם מרפסת בהרצליה', 'הרצליה', 'נווה עמל', 3600, '2026-11-10', false, 3, 'דירת גג מרווחת, קרובה לתחנת הרכבת ולים. שותפים צעירים ונעימים.',
  array['https://images.unsplash.com/photo-1630699144035-c0f6311ec482?auto=format&fit=crop&w=1000&q=75', 'https://images.unsplash.com/photo-1638840992956-142399e7e2df?auto=format&fit=crop&w=1000&q=75', 'https://images.unsplash.com/photo-1560448075-cbc16bb4af8e?auto=format&fit=crop&w=1000&q=75']::text[], 'any', 24, 34, 'no', 'any', false, 'working',
  '[{"name": "אורי", "age": 26, "occupation": "מפתח תוכנה"}, {"name": "מיכל", "age": 27, "occupation": "מנהלת מוצר"}]'::jsonb, true, now() - interval '6 hours')
on conflict (id) do nothing;

-- שיר (אריאל)
insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, banned_until, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-4000-8000-000000000007', 'authenticated', 'authenticated', 'sample7@sample.invalid', null, now(), '2999-01-01', '{"provider":"email"}', '{"first_name": "שיר", "age": 25}'::jsonb, now(), now(), '', '', '', '')
on conflict (id) do nothing;
insert into profiles (user_id, first_name, age, gender, occupation, smoking, has_pet, cleanliness, sleep, guests, kosher, bio)
values ('a0000000-0000-4000-8000-000000000007', 'שיר', 25, 'female', 'student', 'no', false, 'normal', 'flexible', 'sometimes', false, 'סטודנטית לתואר שני, אוהבת מוזיקה וקפה.')
on conflict (user_id) do update set first_name=excluded.first_name, age=excluded.age, gender=excluded.gender, occupation=excluded.occupation, smoking=excluded.smoking, has_pet=excluded.has_pet, cleanliness=excluded.cleanliness, sleep=excluded.sleep, guests=excluded.guests, kosher=excluded.kosher, bio=excluded.bio;
insert into posts (id, owner_id, title, city, neighborhood, rent, available_from, available_now, roommates_total, description, photos, pref_gender, pref_age_min, pref_age_max, pref_smoking, pref_pets, pref_kosher, pref_occupation, roommates, is_sample, created_at)
values ('b0000000-0000-4000-8000-000000000007', 'a0000000-0000-4000-8000-000000000007', 'חדר בדירת סטודנטיות ליד האוניברסיטה באריאל', 'אריאל', 'מרכז העיר', 1100, '2026-10-18', false, 3, 'דירה חמה ומסודרת, הליכה קצרה לאוניברסיטה. שוכרים בשקט ובכבוד.',
  array['https://images.unsplash.com/photo-1560184897-67f4a3f9a7fa?auto=format&fit=crop&w=1000&q=75', 'https://images.unsplash.com/photo-1585128792103-0b591f96512e?auto=format&fit=crop&w=1000&q=75', 'https://images.unsplash.com/photo-1630699144641-72fa7a6b8aa1?auto=format&fit=crop&w=1000&q=75']::text[], 'female', 20, 30, 'no', 'any', false, 'student',
  '[{"name": "שיר", "age": 25, "occupation": "סטודנטית"}, {"name": "נטע", "age": 23, "occupation": "סטודנטית"}]'::jsonb, true, now() - interval '7 hours')
on conflict (id) do nothing;

-- דניאל (פתח תקווה)
insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, banned_until, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-4000-8000-000000000008', 'authenticated', 'authenticated', 'sample8@sample.invalid', null, now(), '2999-01-01', '{"provider":"email"}', '{"first_name": "דניאל", "age": 29}'::jsonb, now(), now(), '', '', '', '')
on conflict (id) do nothing;
insert into profiles (user_id, first_name, age, gender, occupation, smoking, has_pet, cleanliness, sleep, guests, kosher, bio)
values ('a0000000-0000-4000-8000-000000000008', 'דניאל', 29, 'male', 'working', 'no', false, 'normal', 'flexible', 'sometimes', false, 'מורה לחינוך גופני, אוהב בישול איטלקי.')
on conflict (user_id) do update set first_name=excluded.first_name, age=excluded.age, gender=excluded.gender, occupation=excluded.occupation, smoking=excluded.smoking, has_pet=excluded.has_pet, cleanliness=excluded.cleanliness, sleep=excluded.sleep, guests=excluded.guests, kosher=excluded.kosher, bio=excluded.bio;
insert into posts (id, owner_id, title, city, neighborhood, rent, available_from, available_now, roommates_total, description, photos, pref_gender, pref_age_min, pref_age_max, pref_smoking, pref_pets, pref_kosher, pref_occupation, roommates, is_sample, created_at)
values ('b0000000-0000-4000-8000-000000000008', 'a0000000-0000-4000-8000-000000000008', 'חדר בדירת 4 חדרים בפתח תקווה', 'פתח תקווה', 'כפר גנים', 2400, '2026-11-20', false, 3, 'דירה נעימה עם חדר כביסה וחניה. מחפשים שותף חברותי.',
  array['https://images.unsplash.com/photo-1617228133035-2347f159e755?auto=format&fit=crop&w=1000&q=75', 'https://images.unsplash.com/photo-1599202937077-3f7cdc53f2e1?auto=format&fit=crop&w=1000&q=75', 'https://images.unsplash.com/photo-1630699376167-3870469e7598?auto=format&fit=crop&w=1000&q=75']::text[], 'any', 25, 36, 'any', 'any', false, 'any',
  '[{"name": "דניאל", "age": 29, "occupation": "מורה"}, {"name": "עומר", "age": 31, "occupation": "חשמלאי"}]'::jsonb, true, now() - interval '8 hours')
on conflict (id) do nothing;

-- רוני (נתניה)
insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, banned_until, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-4000-8000-000000000009', 'authenticated', 'authenticated', 'sample9@sample.invalid', null, now(), '2999-01-01', '{"provider":"email"}', '{"first_name": "רוני", "age": 27}'::jsonb, now(), now(), '', '', '', '')
on conflict (id) do nothing;
insert into profiles (user_id, first_name, age, gender, occupation, smoking, has_pet, cleanliness, sleep, guests, kosher, bio)
values ('a0000000-0000-4000-8000-000000000009', 'רוני', 27, 'female', 'working', 'no', false, 'normal', 'flexible', 'sometimes', false, 'אחות במרכז רפואי, משמרות מתחלפות. מעריכה שקט.')
on conflict (user_id) do update set first_name=excluded.first_name, age=excluded.age, gender=excluded.gender, occupation=excluded.occupation, smoking=excluded.smoking, has_pet=excluded.has_pet, cleanliness=excluded.cleanliness, sleep=excluded.sleep, guests=excluded.guests, kosher=excluded.kosher, bio=excluded.bio;
insert into posts (id, owner_id, title, city, neighborhood, rent, available_from, available_now, roommates_total, description, photos, pref_gender, pref_age_min, pref_age_max, pref_smoking, pref_pets, pref_kosher, pref_occupation, roommates, is_sample, created_at)
values ('b0000000-0000-4000-8000-000000000009', 'a0000000-0000-4000-8000-000000000009', 'חדר בדירה קרובה לים בנתניה', 'נתניה', 'קריית נורדאו', 2200, '2026-12-05', false, 2, 'דירה קטנה ונעימה, חמש דקות הליכה מהים. שקט ונקי.',
  array['https://images.unsplash.com/photo-1600494448850-6013c64ba722?auto=format&fit=crop&w=1000&q=75', 'https://images.unsplash.com/photo-1499916078039-922301b0eb9b?auto=format&fit=crop&w=1000&q=75', 'https://images.unsplash.com/photo-1759691337957-ebc9ed54dc44?auto=format&fit=crop&w=1000&q=75']::text[], 'female', 25, 35, 'no', 'any', false, 'working',
  '[{"name": "רוני", "age": 27, "occupation": "אחות"}]'::jsonb, true, now() - interval '9 hours')
on conflict (id) do nothing;

-- איתי (ראשון לציון)
insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, banned_until, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-4000-8000-000000000010', 'authenticated', 'authenticated', 'sample10@sample.invalid', null, now(), '2999-01-01', '{"provider":"email"}', '{"first_name": "איתי", "age": 32}'::jsonb, now(), now(), '', '', '', '')
on conflict (id) do nothing;
insert into profiles (user_id, first_name, age, gender, occupation, smoking, has_pet, cleanliness, sleep, guests, kosher, bio)
values ('a0000000-0000-4000-8000-000000000010', 'איתי', 32, 'male', 'working', 'no', false, 'normal', 'early', 'sometimes', false, 'מהנדס בניין, אוהב אופניים ובישול.')
on conflict (user_id) do update set first_name=excluded.first_name, age=excluded.age, gender=excluded.gender, occupation=excluded.occupation, smoking=excluded.smoking, has_pet=excluded.has_pet, cleanliness=excluded.cleanliness, sleep=excluded.sleep, guests=excluded.guests, kosher=excluded.kosher, bio=excluded.bio;
insert into posts (id, owner_id, title, city, neighborhood, rent, available_from, available_now, roommates_total, description, photos, pref_gender, pref_age_min, pref_age_max, pref_smoking, pref_pets, pref_kosher, pref_occupation, roommates, is_sample, created_at)
values ('b0000000-0000-4000-8000-000000000010', 'a0000000-0000-4000-8000-000000000010', 'חדר פנוי עכשיו בראשון לציון', 'ראשון לציון', 'נחלת יהודה', 2700, null, true, 3, 'החדר פנוי לכניסה מיידית, מרוהט חלקית. שותפים רגועים.',
  array['https://images.unsplash.com/photo-1631048501831-46856f9eaaf2?auto=format&fit=crop&w=1000&q=75', 'https://images.unsplash.com/photo-1552558636-f6a8f071c2b3?auto=format&fit=crop&w=1000&q=75', 'https://images.unsplash.com/photo-1755624222023-621f7718950b?auto=format&fit=crop&w=1000&q=75']::text[], 'any', 26, 38, 'no', 'any', false, 'any',
  '[{"name": "איתי", "age": 32, "occupation": "מהנדס בניין"}, {"name": "לירון", "age": 30, "occupation": "מנהלת פרויקטים"}]'::jsonb, true, now() - interval '10 hours')
on conflict (id) do nothing;
