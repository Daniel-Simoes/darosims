-- Run in Supabase SQL Editor for online/typing indicators in document chat.

create table if not exists public.document_chat_presence (
  id text primary key,
  body jsonb not null
);

create index if not exists document_chat_presence_body_document_idx
  on public.document_chat_presence ((body->>'documentId'));

grant all on public.document_chat_presence to service_role;
