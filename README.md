# שותפים – אתר חינמי לחיפוש שותפים לדירה

## הרצה מקומית (מצב דמו, בלי הגדרות)
    npm install && npm run dev

## עלייה לאוויר – הכול חינם
1. **Supabase** (supabase.com) → New project → SQL Editor → הדביקו והריצו את `supabase/schema.sql`.
2. Authentication → URL Configuration → הוסיפו את כתובת האתר שלכם ל-Site URL.
3. Project Settings → API → העתיקו `URL` ו-`anon key` לקובץ `.env` (לפי `.env.example`).
4. **Cloudflare Pages** או **Netlify** → חברו ריפו ב-GitHub, Build: `npm run build`, Output: `dist`, והוסיפו את אותם שני משתנים.

מגבלות החינמי של Supabase: 500MB מסד, 1GB תמונות. התמונות מכווצות בדפדפן כדי להאריך את זה.

## מצב אורח
כשמחוברים ל-Supabase, מי שלא רשום יכול ללחוץ "נסו את האתר בלי להירשם". זה מפעיל את מצב הדמו (נתונים מקומיים בדפדפן בלבד), בלי לגעת במסד האמיתי.

## משתני סביבה ב-Netlify
Site configuration → Environment variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` (מפתח publishable בלבד, לעולם לא secret / service_role)

המשתנים נכנסים לאתר בזמן הבנייה, ולכן אחרי שינוי צריך לבנות מחדש (Deploys → Trigger deploy).
