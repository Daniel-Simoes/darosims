# Daros IMS — Architecture Overview

## CURRENT (implemented)

Daros IMS is a document management MVP with:

- **Frontend:** React 19 + Vite (`localhost:5173`)
- **Backend:** Next.js 15 API routes (`localhost:3000`)
- **Auth:** JWT (local storage token, 24h expiry)
- **Storage:** JSON files + local file uploads (`backend/data/`)

### Layered architecture

```
UI (React components/pages)
  ↓
API client (src/lib/api/*)
  ↓
Next.js API routes (backend/src/app/api/*)
  ↓
Services (backend/src/services/*) — business rules
  ↓
Repositories (backend/src/repositories/*) — JSON/file I/O
  ↓
Data files (backend/data/*.json, backend/data/uploads/)
```

### Design principles

1. **Extend, don't rebuild** — existing behaviour preserved
2. **Domain separation** — documents, notifications, auth, audit
3. **Repository pattern** — data access isolated for future PostgreSQL migration
4. **Backward-compatible barrels** — old import paths still work where needed

## FUTURE / PLANNED

- PostgreSQL via Supabase
- Supabase Auth (replace JWT)
- Supabase Storage (replace local uploads)
- Multi-tenant companies + RBAC permissions
- Full audit log service

See `docs/database/future-database-architecture.md` and `docs/storage/storage-architecture.md`.
