# Deploy darosims.com on Vercel (Hobby / free)

One Vercel project serves the **Vite marketing app + dashboard** and the **Next.js API** on the same domain (`/api/*`).

## 1. Import the GitHub repo

1. Sign in at [vercel.com](https://vercel.com) with GitHub.
2. **Add New → Project** → import `Daniel-Simoes/darosims`.
3. Set **Root Directory** to `backend` (important).
4. Leave **Framework Preset** as Next.js. Vercel reads `backend/vercel.json` for install/build commands (install uses `--include=dev` so Vite/TypeScript are available during build).

## 2. Environment variables

In **Project → Settings → Environment Variables** (Production):

| Variable | Example | Notes |
| -------- | ------- | ----- |
| `JWT_SECRET` | long random string | Required in production |
| `ADMIN_EMAIL` | you@darosims.com | First login when no users file |
| `ADMIN_PASSWORD` | strong password | Same |
| `CORS_ORIGIN` | `https://darosims.com` | Use your canonical URL |
| `DATA_DIR` | `/tmp/darosims-data` | Writable path on Vercel (ephemeral) |

Redeploy after changing env vars.

**Persistence:** On the free tier, API data and uploads live under `/tmp` and can reset between cold starts. The marketing site is fully static. For durable documents, plan PostgreSQL + blob storage later.

## 3. Custom domain (Let's Host → Vercel)

In Vercel: **Project → Settings → Domains** → add `darosims.com` and `www.darosims.com`.

At **Let's Host** DNS for `darosims.com`:

| Type | Name | Value |
| ---- | ---- | ----- |
| **A** | `@` | `76.76.21.21` |
| **CNAME** | `www` | `cname.vercel-dns.com` |

(Vercel may show slightly different records after you add the domain — use what the Vercel UI displays.)

Propagation can take up to 24–48 hours; often much faster.

## 4. Local production build (optional check)

```bash
npm run build
node scripts/sync-frontend-to-backend.mjs
npm run build --prefix backend
```

## 5. CLI deploy (optional)

```bash
npx vercel --cwd backend
npx vercel --cwd backend --prod
```

Link the project to the same GitHub repo so pushes to `main` auto-deploy.
