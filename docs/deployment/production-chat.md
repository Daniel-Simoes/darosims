# Chat in production (all users)

Document chat is **not** stored on each user’s computer. In production it uses the same **Supabase** database as documents and notifications, on **Vercel** at:

**https://darosims.vercel.app**

(Use this URL until `darosims.com` DNS points to Vercel — see below.)

## Why chat worked locally but not on the web

| Environment | Storage | Shared between users? |
| ----------- | ------- | --------------------- |
| Local `npm run dev:all` | `backend/data/*.json` | Only on your machine |
| Vercel + Supabase | PostgreSQL (`document_comments` table) | Yes — all logged-in users |

If Supabase was set up **before** the chat feature, the `document_comments` table may be missing. The API then returns errors like `Could not find the table 'public.document_comments'`.

## Fix chat on production (one-time, ~2 minutes)

1. Open [Supabase](https://supabase.com) → your project (same as `SUPABASE_URL` in Vercel).
2. **SQL Editor** → **New query**.
3. Paste and run the file **`backend/supabase/patch-document-comments.sql`** from this repo (or the full **`backend/supabase/schema.sql`** if you prefer).
4. Verify: open **https://darosims.vercel.app/api/health**  
   - After the next deploy: `"ok": true`, `"chatReady": true`  
   - Until deploy: chat works as soon as the SQL ran (no redeploy required for SQL only).

5. Sign in on **https://darosims.vercel.app**, open **Chat** or send a message from Document Control — all users on that site share the same threads.

## Vercel environment (required for shared data)

In **Vercel → darosims → Settings → Environment Variables** (Production):

| Variable | Value |
| -------- | ----- |
| `DATABASE_PROVIDER` | `supabase` |
| `SUPABASE_URL` | `https://xxxx.supabase.co` (Project URL, not Postgres string) |
| `SUPABASE_SERVICE_ROLE_KEY` | service role secret |
| `JWT_SECRET` | strong secret |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | bootstrap admin |
| `CORS_ORIGIN` | `https://darosims.vercel.app` (add `https://darosims.com` when DNS is fixed) |

Redeploy after changing env vars.

## Custom domain `darosims.com`

Today the domain may still show a **LetsHost parking page** instead of Vercel. Point DNS to Vercel (see [vercel-darosims.md](./vercel-darosims.md)), then set `CORS_ORIGIN` to your canonical HTTPS URL and redeploy.

## Quick checks

```bash
# Health (should include chatReady: true after SQL + supabase)
curl -s https://darosims.vercel.app/api/health

# Chats list (401 without token is OK)
curl -s https://darosims.vercel.app/api/document-chats
```
