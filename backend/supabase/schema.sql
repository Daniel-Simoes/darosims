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

create table if not exists public.document_field_options (
  id text primary key,
  body jsonb not null
);

create table if not exists public.approval_meetings (
  id text primary key,
  document_id text not null references public.documents (id) on delete restrict,
  document_version integer not null,
  status text not null check (status in ('scheduled', 'in_progress', 'completed', 'cancelled')),
  scheduled_starts_at timestamptz not null,
  timezone text not null,
  created_by text not null,
  created_at timestamptz not null default now(),
  body jsonb not null
);

create table if not exists public.meeting_decisions (
  id text primary key,
  meeting_id text not null unique references public.approval_meetings (id) on delete restrict,
  document_id text not null references public.documents (id) on delete restrict,
  document_version integer not null,
  status text not null check (status in ('pending', 'reviewed', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  body jsonb not null
);

create index if not exists documents_body_created_by_idx on public.documents ((body->>'createdBy'));
create index if not exists documents_body_status_idx on public.documents ((body->>'status'));
create index if not exists notifications_body_recipient_idx on public.notifications ((body->>'recipientEmail'));
create index if not exists document_events_body_document_idx on public.document_events ((body->>'documentId'));
create index if not exists document_comments_body_document_idx on public.document_comments ((body->>'documentId'));
create index if not exists document_chat_presence_body_document_idx on public.document_chat_presence ((body->>'documentId'));
create index if not exists document_archives_body_source_idx on public.document_archives ((body->>'sourceDocumentId'));
create index if not exists approval_meetings_document_id_idx on public.approval_meetings (document_id);
create index if not exists approval_meetings_status_idx on public.approval_meetings (status);
create index if not exists approval_meetings_document_version_idx on public.approval_meetings (document_id, document_version);
create index if not exists meeting_decisions_document_id_idx on public.meeting_decisions (document_id);
create index if not exists meeting_decisions_status_idx on public.meeting_decisions (status);

alter table public.documents enable row level security;
alter table public.users enable row level security;
alter table public.notifications enable row level security;
alter table public.document_events enable row level security;
alter table public.document_comments enable row level security;
alter table public.document_chat_presence enable row level security;
alter table public.document_archives enable row level security;
alter table public.document_field_options enable row level security;
alter table public.approval_meetings enable row level security;
alter table public.meeting_decisions enable row level security;

revoke all on public.documents from anon, authenticated;
revoke all on public.users from anon, authenticated;
revoke all on public.notifications from anon, authenticated;
revoke all on public.document_events from anon, authenticated;
revoke all on public.document_comments from anon, authenticated;
revoke all on public.document_chat_presence from anon, authenticated;
revoke all on public.document_archives from anon, authenticated;
revoke all on public.document_field_options from anon, authenticated;
revoke all on public.approval_meetings from anon, authenticated;
revoke all on public.meeting_decisions from anon, authenticated;

grant all on public.documents to service_role;
grant all on public.users to service_role;
grant all on public.notifications to service_role;
grant all on public.document_events to service_role;
grant all on public.document_comments to service_role;
grant all on public.document_chat_presence to service_role;
grant all on public.document_archives to service_role;
grant all on public.document_field_options to service_role;
grant all on public.approval_meetings to service_role;
grant all on public.meeting_decisions to service_role;

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

drop policy if exists "service role only document_field_options" on public.document_field_options;
create policy "service role only document_field_options" on public.document_field_options
  for all to service_role using (true) with check (true);

drop policy if exists "service role only approval_meetings" on public.approval_meetings;
create policy "service role only approval_meetings" on public.approval_meetings
  for all to service_role using (true) with check (true);

drop policy if exists "service role only meeting_decisions" on public.meeting_decisions;
create policy "service role only meeting_decisions" on public.meeting_decisions
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
