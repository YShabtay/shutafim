-- Security advisor cleanup. Safe to run more than once.

-- 1. Trigger functions are only ever called by triggers, never through the API.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.notify_application() from public, anon, authenticated;
revoke execute on function public.notify_application_decision() from public, anon, authenticated;
revoke execute on function public.notify_message() from public, anon, authenticated;

-- 2. Pin the search_path of the username check.
alter function public.username_clean(text) set search_path = public;

-- 3. Public bucket: files stay readable by URL, but nobody can list the whole bucket.
drop policy if exists "public read photos" on storage.objects;
