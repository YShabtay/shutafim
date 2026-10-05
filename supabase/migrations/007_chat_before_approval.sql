-- Application flow: pending -> chatting -> accepted | declined.
-- Opening a chat no longer approves the applicant; the final approval is a separate step.
-- No Hebrew text here: wording lives in the app.

-- owner may move an application to chatting / accepted / declined
drop policy if exists "owner decides" on applications;
create policy "owner decides" on applications for update
  using (owner_id = auth.uid())
  with check (status in ('pending', 'chatting', 'accepted', 'declined'));

-- a conversation may start once the owner opened a chat (chatting) or approved (accepted)
drop policy if exists "start conv after accept" on conversations;
create policy "start conv after accept" on conversations for insert
  with check (auth.uid() in (owner_id, seeker_id) and exists (
    select 1 from applications a
     where a.post_id = conversations.post_id
       and a.applicant_id = conversations.seeker_id
       and a.owner_id = conversations.owner_id
       and a.status in ('chatting', 'accepted')));

-- notify the applicant on chatting / accepted / declined (kind = the new status)
drop trigger if exists on_application_decided on applications;
create trigger on_application_decided after update of status on applications
  for each row when (old.status is distinct from new.status and new.status in ('chatting', 'accepted', 'declined'))
  execute function public.notify_application_decision();
