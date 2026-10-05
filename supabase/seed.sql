-- נתוני דוגמה. הריצו ב-Supabase: SQL Editor -> New query -> Run (אחרי schema.sql).
-- יוצר 7 משתמשי דמה (בלי סיסמה, אי אפשר להתחבר איתם), פרופילים ו-5 מודעות.
-- בטוח להרצה חוזרת. למחיקה: delete from auth.users where email like '%@seed.shutafim.local';

insert into auth.users (id, aud, role, email, created_at, updated_at) values
  ('00000000-0000-0000-0000-0000000000a1', 'authenticated', 'authenticated', 'noa@seed.shutafim.local', now(), now()),
  ('00000000-0000-0000-0000-0000000000a2', 'authenticated', 'authenticated', 'maya@seed.shutafim.local', now(), now()),
  ('00000000-0000-0000-0000-0000000000a3', 'authenticated', 'authenticated', 'ido@seed.shutafim.local', now(), now()),
  ('00000000-0000-0000-0000-0000000000a4', 'authenticated', 'authenticated', 'tal@seed.shutafim.local', now(), now()),
  ('00000000-0000-0000-0000-0000000000a5', 'authenticated', 'authenticated', 'lior@seed.shutafim.local', now(), now()),
  ('00000000-0000-0000-0000-0000000000a6', 'authenticated', 'authenticated', 'dana@seed.shutafim.local', now(), now()),
  ('00000000-0000-0000-0000-0000000000a7', 'authenticated', 'authenticated', 'amit@seed.shutafim.local', now(), now())
on conflict (id) do nothing;

insert into profiles (user_id, first_name, age, gender, occupation, smoking, has_pet, cleanliness, sleep, guests, kosher, bio) values
  ('00000000-0000-0000-0000-0000000000a1', 'נועה', 28, 'female', 'working', 'no', false, 'tidy', 'flexible', 'sometimes', false, 'מעצבת גרפית, אוהבת בישולים וערבים רגועים בבית.'),
  ('00000000-0000-0000-0000-0000000000a2', 'מאיה', 24, 'female', 'student', 'no', false, 'normal', 'night', 'often', false, 'לומדת פסיכולוגיה, חברותית ואוהבת לארח.'),
  ('00000000-0000-0000-0000-0000000000a3', 'עידו', 31, 'male', 'working', 'no', true, 'normal', 'flexible', 'sometimes', false, 'מפתח תוכנה, עובד הרבה מהבית. חתול אחד, לא מזיק.'),
  ('00000000-0000-0000-0000-0000000000a4', 'טל', 23, 'male', 'student', 'no', false, 'normal', 'flexible', 'often', false, 'סטודנט להנדסה, אוהב כדורגל ומשחקי קופסה.'),
  ('00000000-0000-0000-0000-0000000000a5', 'ליאור', 30, 'female', 'working', 'no', false, 'tidy', 'early', 'sometimes', false, 'רופאת שיניים, קמה מוקדם ומחפשת שקט.'),
  ('00000000-0000-0000-0000-0000000000a6', 'דנה', 26, 'female', 'working', 'no', false, 'tidy', 'flexible', 'sometimes', false, 'עובדת בהייטק, אוהבת יוגה וקפה. מחפשת בית רגוע.'),
  ('00000000-0000-0000-0000-0000000000a7', 'עמית', 27, 'male', 'student', 'no', false, 'normal', 'night', 'sometimes', false, 'סטודנט לתואר שני, שקט ואחראי.')
on conflict (user_id) do nothing;

insert into posts (id, owner_id, title, city, neighborhood, rent, available_from, roommates_total, description,
                   pref_gender, pref_age_min, pref_age_max, pref_smoking, pref_pets, pref_kosher, pref_occupation, roommates, created_at) values
  ('00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-0000000000a1',
   'חדר מרווח בדירת 3 חדרים בפלורנטין', 'תל אביב', 'פלורנטין', 3200, '2026-11-01', 3,
   'דירה מוארת עם מרפסת, שותפים נעימים. מחפשים מישהו שקט ואחראי.',
   'any', 24, 32, 'no', 'any', false, 'working',
   '[{"name":"נועה","age":28,"occupation":"מעצבת גרפית"},{"name":"גיל","age":30,"occupation":"מהנדס"}]', now()),
  ('00000000-0000-0000-0000-0000000000b2', '00000000-0000-0000-0000-0000000000a2',
   'שותפה לדירה ליד האוניברסיטה', 'ירושלים', 'גבעת רם', 1900, '2026-10-20', 4,
   'דירת סטודנטיות, אווירה טובה, קרוב לקמפוס.',
   'female', 20, 28, 'no', 'no', true, 'student',
   '[{"name":"מאיה","age":24,"occupation":"סטודנטית לפסיכולוגיה"},{"name":"שירה","age":23,"occupation":"סטודנטית לביולוגיה"},{"name":"יעל","age":25,"occupation":"סטודנטית למשפטים"}]', now()),
  ('00000000-0000-0000-0000-0000000000b3', '00000000-0000-0000-0000-0000000000a3',
   'סטודיו משותף עם נוף לים, מחפשים שותף/ה רגועים', 'חיפה', 'הדר', 2100, '2026-11-15', 2,
   'דירה שקטה עם מרפסת גדולה. אוהבים בישולים משותפים וערבי משחקי קופסה.',
   'any', 25, 38, 'no', 'yes', false, 'working',
   '[{"name":"עידו","age":31,"occupation":"מפתח תוכנה"}]', now() - interval '2 days'),
  ('00000000-0000-0000-0000-0000000000b4', '00000000-0000-0000-0000-0000000000a4',
   'חדר בדירת סטודנטים בבאר שבע, קרוב לאוניברסיטה', 'באר שבע', 'שכונה ד׳', 1300, '2026-10-25', 4,
   'דירה גדולה ומשופצת, שלושה שותפים חברותיים. חוויה סטודנטיאלית אמיתית.',
   'any', 20, 30, 'any', 'any', false, 'student',
   '[{"name":"טל","age":23,"occupation":"סטודנט להנדסה"},{"name":"אורי","age":24,"occupation":"סטודנט לכלכלה"},{"name":"נדב","age":22,"occupation":"סטודנט למדעי המחשב"}]', now() - interval '5 days'),
  ('00000000-0000-0000-0000-0000000000b5', '00000000-0000-0000-0000-0000000000a5',
   'שותפה לדירה מעוצבת ברמת גן', 'רמת גן', 'בורסה', 2900, '2026-12-01', 2,
   'דירת 3 חדרים מעוצבת, קרובה לרכבת. מחפשת שותפה מסודרת ופתוחה.',
   'female', 26, 35, 'no', 'no', false, 'working',
   '[{"name":"ליאור","age":30,"occupation":"רופאת שיניים"}]', now() - interval '1 day')
on conflict (id) do nothing;
