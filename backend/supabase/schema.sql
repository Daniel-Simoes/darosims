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

create index if not exists documents_body_created_by_idx on public.documents ((body->>'createdBy'));
create index if not exists documents_body_status_idx on public.documents ((body->>'status'));
create index if not exists notifications_body_recipient_idx on public.notifications ((body->>'recipientEmail'));
create index if not exists document_events_body_document_idx on public.document_events ((body->>'documentId'));

-- Private bucket for PDFs / source files (create in Storage if this insert fails)
insert into storage.buckets (id, name, public)
values ('darosims-files', 'darosims-files', false)
on conflict (id) do nothing;
