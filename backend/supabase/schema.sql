-- Daros IMS — Supabase (free tier) schema
-- Run in Supabase Dashboard → SQL → New query

create table if not exists public.documents (
  id text primary key,
  body jsonb not null
);

create table if not exists public.users (
  email text primary key,
  body jsonb not null
);

create table if not exists public.notifications (
  id text primary key,
  body jsonb not null
);

create table if not exists public.document_events (
  id text primary key,
  body jsonb not null
);

create table if not exists public.document_comments (
  id text primary key,
  body jsonb not null
);

create table if not exists public.document_chat_presence (
  id text primary key,
  body jsonb not null
);

create table if not exists public.document_archives (
  id text primary key,
  body jsonb not null
);

create index if not exists documents_body_created_by_idx on public.documents ((body->>'createdBy'));
create index if not exists documents_body_status_idx on public.documents ((body->>'status'));
create index if not exists notifications_body_recipient_idx on public.notifications ((body->>'recipientEmail'));
create index if not exists document_events_body_document_idx on public.document_events ((body->>'documentId'));
create index if not exists document_comments_body_document_idx on public.document_comments ((body->>'documentId'));
create index if not exists document_chat_presence_body_document_idx on public.document_chat_presence ((body->>'documentId'));
create index if not exists document_archives_body_source_idx on public.document_archives ((body->>'sourceDocumentId'));

alter table public.documents enable row level security;
alter table public.users enable row level security;
alter table public.notifications enable row level security;
alter table public.document_events enable row level security;
alter table public.document_comments enable row level security;
alter table public.document_chat_presence enable row level security;
alter table public.document_archives enable row level security;

revoke all on public.documents from anon, authenticated;
revoke all on public.users from anon, authenticated;
revoke all on public.notifications from anon, authenticated;
revoke all on public.document_events from anon, authenticated;
revoke all on public.document_comments from anon, authenticated;
revoke all on public.document_chat_presence from anon, authenticated;
revoke all on public.document_archives from anon, authenticated;

grant all on public.documents to service_role;
grant all on public.users to service_role;
grant all on public.notifications to service_role;
grant all on public.document_events to service_role;
grant all on public.document_comments to service_role;
grant all on public.document_chat_presence to service_role;
grant all on public.document_archives to service_role;

drop policy if exists "service role only documents" on public.documents;
create policy "service role only documents" on public.documents
  for all to service_role using (true) with check (true);

drop policy if exists "service role only users" on public.users;
create policy "service role only users" on public.users
  for all to service_role using (true) with check (true);

drop policy if exists "service role only notifications" on public.notifications;
create policy "service role only notifications" on public.notifications
  for all to service_role using (true) with check (true);

drop policy if exists "service role only document_events" on public.document_events;
create policy "service role only document_events" on public.document_events
  for all to service_role using (true) with check (true);

drop policy if exists "service role only document_comments" on public.document_comments;
create policy "service role only document_comments" on public.document_comments
  for all to service_role using (true) with check (true);

drop policy if exists "service role only document_chat_presence" on public.document_chat_presence;
create policy "service role only document_chat_presence" on public.document_chat_presence
  for all to service_role using (true) with check (true);

drop policy if exists "service role only document_archives" on public.document_archives;
create policy "service role only document_archives" on public.document_archives
  for all to service_role using (true) with check (true);

-- Private bucket for PDFs / source files (create in Storage if this insert fails)
insert into storage.buckets (id, name, public)
values ('darosims-files', 'darosims-files', false)
on conflict (id) do nothing;

-- Service role (backend) manages files; no public access.
drop policy if exists "darosims service role storage" on storage.objects;
create policy "darosims service role storage"
on storage.objects for all
to service_role
using (bucket_id = 'darosims-files')
with check (bucket_id = 'darosims-files');
