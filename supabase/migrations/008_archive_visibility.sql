-- Archived posts (status = 'taken') stay visible to people who applied to them,
-- so an approved roommate can still open the apartment, the chat and the request list.
-- No Hebrew text here.
drop policy if exists "applicants read their posts" on posts;
create policy "applicants read their posts" on posts for select
  using (exists (select 1 from applications a where a.post_id = posts.id and a.applicant_id = auth.uid()));
