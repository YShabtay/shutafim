# שותפים – אתר חינמי לחיפוש שותפים לדירה

## הרצה מקומית (מצב דמו, בלי הגדרות)
    npm install && npm run dev

## עלייה לאוויר – הכול חינם
1. **Supabase** (supabase.com) → New project → SQL Editor → הדביקו והריצו את `supabase/schema.sql`.
2. Authentication → URL Configuration → הוסיפו את כתובת האתר שלכם ל-Site URL.
3. Project Settings → API → העתיקו `URL` ו-`anon key` לקובץ `.env` (לפי `.env.example`).
4. **Cloudflare Pages** או **Netlify** → חברו ריפו ב-GitHub, Build: `npm run build`, Output: `dist`, והוסיפו את אותם שני משתנים.

מגבלות החינמי של Supabase: 500MB מסד, 1GB תמונות. התמונות מכווצות בדפדפן כדי להאריך את זה.
