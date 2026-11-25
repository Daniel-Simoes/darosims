-- Daros Live — approval meetings & meeting decisions (Phase 1)
-- Run in Supabase Dashboard → SQL Editor (existing projects).
-- New installs: tables are also appended to backend/supabase/schema.sql.

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

create index if not exists approval_meetings_document_id_idx
  on public.approval_meetings (document_id);

create index if not exists approval_meetings_status_idx
  on public.approval_meetings (status);

create index if not exists approval_meetings_document_version_idx
  on public.approval_meetings (document_id, document_version);

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

create index if not exists meeting_decisions_document_id_idx
  on public.meeting_decisions (document_id);

create index if not exists meeting_decisions_status_idx
  on public.meeting_decisions (status);

alter table public.approval_meetings enable row level security;
alter table public.meeting_decisions enable row level security;

revoke all on public.approval_meetings from anon, authenticated;
revoke all on public.meeting_decisions from anon, authenticated;

grant all on public.approval_meetings to service_role;
grant all on public.meeting_decisions to service_role;

drop policy if exists "service role only approval_meetings" on public.approval_meetings;
create policy "service role only approval_meetings" on public.approval_meetings
  for all to service_role using (true) with check (true);

drop policy if exists "service role only meeting_decisions" on public.meeting_decisions;
create policy "service role only meeting_decisions" on public.meeting_decisions
  for all to service_role using (true) with check (true);