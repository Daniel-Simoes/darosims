# Supabase (free) for Daros IMS

Use [Supabase](https://supabase.com) **free tier** (PostgreSQL + Storage) so documents, users, notifications, and audit events **persist** on Vercel (unlike `/tmp` JSON files).

Local dev keeps **JSON files** unless you set the variables below.

## 1. Create project

1. [supabase.com](https://supabase.com) → **New project** (choose EU region if you prefer).
2. Wait for the database to provision.

## 2. Run schema

**SQL Editor** → New query → paste and run:

`backend/supabase/schema.sql`

## 3. Storage bucket

If the SQL bucket insert fails, create manually:

**Storage** → **New bucket** → name `darosims-files`, **Private**.

## 4. API keys

**Project Settings** → **API**:

- **Project URL** → `SUPABASE_URL`
- **service_role** key (secret) → `SUPABASE_SERVICE_ROLE_KEY`  
  Never expose this in the frontend — backend only.

## 5. Vercel environment variables

Add to the **darosims** project (Production):

| Variable | Value |
| -------- | ----- |
| `DATABASE_PROVIDER` | `supabase` |
| `SUPABASE_URL` | your project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | service role key |

Keep existing `JWT_SECRET`, `ADMIN_*`, `CORS_ORIGIN`. You can remove `DATA_DIR` when using Supabase.

**Redeploy** after saving.

## 6. Verify

1. Open `https://YOUR-SITE/api/health` — should show `"ok": true` and `"provider": "supabase"`.
2. Sign in on production.
3. **New Document** → create a draft.
4. Supabase **Table Editor** → `documents` → should show a row with JSON `body`.
5. Refresh the site — draft should still appear.

If `/api/health` shows an error about missing tables, run `schema.sql` again in the SQL editor.

## Local dev with Supabase (optional)

Create `backend/.env.local`:

```env
DATABASE_PROVIDER=supabase
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
```

Run `npm run dev:all` as usual.
