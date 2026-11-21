# Security — Daros IMS

## Architecture

- **API-only data access:** The browser never talks to Supabase directly. Only the Next.js backend uses `SUPABASE_SERVICE_ROLE_KEY` (server env). Do **not** ship the service role or database connection strings to the client.
- **Public Supabase key:** If you add Supabase client-side later, use only the **anon** key with **RLS** policies that deny direct table access (see `backend/supabase/schema.sql`).
- **HTTPS:** Enforced on Vercel (`Strict-Transport-Security` in production). Always access the app over HTTPS in production.

## Sessions

- JWT stored in **`HttpOnly` + `SameSite=Lax`** cookie `daros_session` (not accessible to JS).
- Optional legacy `Authorization: Bearer` header is still accepted during migration; remove once all clients use cookies.

## Secrets & git

- `.env`, `.env.local`, and `backend/data/` are gitignored.
- Seed passwords in repo are **bcrypt hashes** only (dev default matches `DEV_SEED_PASSWORD`).
- If a secret was ever committed, rotate it in Vercel/Supabase and consider `git filter-repo` (not run automatically here).

## Passwords

- Stored as **bcrypt** (cost 12). New passwords: minimum **8** characters.
- Change `JWT_SECRET`, `ADMIN_PASSWORD`, and Supabase keys before production.

## Authorization

- Routes check **permissions** (`view_documents`, `create_documents`, `edit_documents`, …).
- Document updates block **mass assignment** of workflow fields (`submittedAt`, `reviewedAt`, …).
- File uploads require `edit_documents` and document edit rights.

## Rate limiting & bots

- Login and LGPD endpoints: in-memory rate limits (per instance on Vercel).
- Honeypot field `website` on login and LGPD forms.

## API surface

- `/api/health` in production returns only `{ ok: true }` unless `x-health-key` matches `HEALTH_CHECK_KEY`.
- List endpoints cap page size (`limit` ≤ 200).

## Dependency scanning

```bash
npm run security:audit
```

## Supabase hardening

1. Run `backend/supabase/schema.sql` (includes RLS + service_role-only policies).
2. On existing projects, also run `backend/supabase/patch-security-rls.sql`.
3. Storage bucket `darosims-files` remains private; service role only.

## Production checklist

- [ ] Strong `JWT_SECRET` in Vercel
- [ ] `CORS_ORIGIN` = exact frontend URL
- [ ] `DEV_SEED_PASSWORD` unset or rotated; seed users updated
- [ ] Supabase RLS applied; service role key only on server
- [ ] No tracking scripts on public site (see legal/cookie policy)