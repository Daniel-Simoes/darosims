# Future Database Architecture

## CURRENT

All persistence uses JSON files:

| File | Data |
|------|------|
| `documents.json` | Document records |
| `notifications.json` | User notifications |
| `document_events.json` | Audit/event log |
| `users.json` | Auth users |
| `uploads/` | PDF and source files |

Accessed exclusively through **repositories** in `backend/src/repositories/`.

## Migration path

When moving to PostgreSQL/Supabase:

1. Implement new repositories (e.g. `PostgresDocumentRepository`) with same interface
2. Swap repository imports in services
3. **Services and API routes unchanged**
4. Run data migration script from JSON → PostgreSQL

## Planned structure

```
backend/src/database/
├── client/         # Supabase/PostgreSQL client (FUTURE)
├── repositories/   # DB-backed repository implementations (FUTURE)
├── models/         # ORM models (FUTURE)
├── schemas/        # SQL/Prisma schemas (FUTURE)
├── migrations/     # Versioned migrations (FUTURE)
└── seed/           # Seed data (FUTURE)
```

`backend/src/database/index.ts` currently exports `{ provider: 'json-files' }` as a status marker.
