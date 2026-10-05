-- Optional: run once in SQL Editor to add Daniel & Rodrigo immediately.
-- Password is stored in plain text (same as local JSON mode).

insert into public.users (email, body) values
(
  'daniel@daros.com',
  '{"email":"daniel@daros.com","password":"1234","name":"Daniel","firstName":"Daniel","lastName":"","role":"admin","permissions":["view_documents","create_documents","edit_documents","create_versions","submit_documents","approve_documents","reject_documents","archive_documents","manage_users","manage_companies","manage_settings","view_audit_logs"]}'::jsonb
),
(
  'rodrigo@daros.com',
  '{"email":"rodrigo@daros.com","password":"1234","name":"Rodrigo","firstName":"Rodrigo","lastName":"","role":"admin","permissions":["view_documents","create_documents","edit_documents","create_versions","submit_documents","approve_documents","reject_documents","archive_documents","manage_users","manage_companies","manage_settings","view_audit_logs"]}'::jsonb
)
on conflict (email) do nothing;
