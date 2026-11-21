-- Run once in Supabase → SQL Editor if Arquivos / archives API returns empty or errors.
-- Safe on existing projects (IF NOT EXISTS).

create table if not exists public.document_archives (
  id text primary key,
  body jsonb not null
);

create index if not exists document_archives_body_source_idx
  on public.document_archives ((body->>'sourceDocumentId'));

create index if not exists document_archives_body_archived_at_idx
  on public.document_archives ((body->>'archivedAt'));

alter table public.document_archives enable row level security;

revoke all on public.document_archives from anon, authenticated;
grant all on public.document_archives to service_role;

drop policy if exists "service role only document_archives" on public.document_archives;
create policy "service role only document_archives" on public.document_archives
  for all to service_role using (true) with check (true);