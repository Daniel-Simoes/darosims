-- Run once in Supabase → SQL Editor if chat fails with "document_comments" missing.
-- Safe on existing projects (IF NOT EXISTS).

create table if not exists public.document_comments (
  id text primary key,
  body jsonb not null
);

create index if not exists document_comments_body_document_idx
  on public.document_comments ((body->>'documentId'));

grant all on public.document_comments to service_role;
