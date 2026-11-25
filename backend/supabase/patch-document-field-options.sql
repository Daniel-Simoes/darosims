-- Optional: persist custom dropdown values app-wide (works without this — values are also collected from documents).
create table if not exists public.document_field_options (
  id text primary key,
  body jsonb not null
);

alter table public.document_field_options enable row level security;
revoke all on public.document_field_options from anon, authenticated;
grant all on public.document_field_options to service_role;

drop policy if exists "service role only document_field_options" on public.document_field_options;
create policy "service role only document_field_options" on public.document_field_options
  for all to service_role using (true) with check (true);