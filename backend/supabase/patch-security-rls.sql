-- Run once on existing Supabase projects (after schema.sql base tables exist).

alter table public.documents enable row level security;
alter table public.users enable row level security;
alter table public.notifications enable row level security;
alter table public.document_events enable row level security;
alter table public.document_comments enable row level security;
alter table public.document_chat_presence enable row level security;

revoke all on public.documents from anon, authenticated;
revoke all on public.users from anon, authenticated;
revoke all on public.notifications from anon, authenticated;
revoke all on public.document_events from anon, authenticated;
revoke all on public.document_comments from anon, authenticated;
revoke all on public.document_chat_presence from anon, authenticated;