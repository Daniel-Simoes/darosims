-- Optional: run once in SQL Editor to seed team accounts.
-- Password hash is for DEV_SEED_PASSWORD default "1234" (bcrypt cost 12).
-- Prefer `ensureDefaultSeedUsers()` via API bootstrap instead of manual SQL.

insert into public.users (email, body) values
(
  'daniel@daros.com',
  '{"email":"daniel@daros.com","password":"$2b$12$xitjiwWbbk7KmGo1EWdLUO0U8e1Qzxl9xwdXhSQfHD0FJCHYsalfi","name":"Daniel","firstName":"Daniel","lastName":"","role":"admin","permissions":["view_documents","create_documents","edit_documents","create_versions","submit_documents","approve_documents","reject_documents","archive_documents","manage_users","manage_companies","manage_settings","view_audit_logs"]}'::jsonb
),
(
  'rodrigo@daros.com',
  '{"email":"rodrigo@daros.com","password":"$2b$12$xitjiwWbbk7KmGo1EWdLUO0U8e1Qzxl9xwdXhSQfHD0FJCHYsalfi","name":"Rodrigo","firstName":"Rodrigo","lastName":"","role":"admin","permissions":["view_documents","create_documents","edit_documents","create_versions","submit_documents","approve_documents","reject_documents","archive_documents","manage_users","manage_companies","manage_settings","view_audit_logs"]}'::jsonb
),
(
  'admin@daros.com',
  '{"email":"admin@daros.com","password":"$2b$12$xitjiwWbbk7KmGo1EWdLUO0U8e1Qzxl9xwdXhSQfHD0FJCHYsalfi","name":"Admin","firstName":"Admin","lastName":"","role":"admin","permissions":["view_documents","create_documents","edit_documents","create_versions","submit_documents","approve_documents","reject_documents","archive_documents","manage_users","manage_companies","manage_settings","view_audit_logs"]}'::jsonb
)
on conflict (email) do update set body = excluded.body;

delete from public.users where email in ('daniel@darosapp.com', 'daniel@darosims.com');