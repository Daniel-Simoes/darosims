# Backend Architecture

## CURRENT structure

```
backend/src/
├── app/api/              # Next.js route handlers (thin)
│   ├── auth/
│   ├── documents/
│   ├── notifications/
│   └── document-events/
├── services/             # Business logic
│   ├── documents/
│   ├── notifications/
│   ├── audit/
│   ├── users/
│   └── storage/
├── repositories/         # Data access (JSON + files)
│   ├── documents/
│   ├── notifications/
│   ├── audit/
│   ├── users/
│   └── storage/
├── lib/                  # Legacy barrels + auth helpers
├── types/                # Domain TypeScript types
├── config/               # env, file paths
└── database/             # Placeholder for future DB client
```

## Route handler pattern

Each API route should:

1. Authenticate (`requireAuth`)
2. Validate input
3. Call a **service** method
4. Return JSON response

Example flow for document rejection:

```
POST /api/documents/[id]/reject
  → rejectDocumentForApproval() [documentService]
  → writeAllDocuments() [documentRepository]
  → createDocumentEvent() [documentEventService]
  → createNotification() [notificationService]
```

## Legacy compatibility

`backend/src/lib/documents.ts`, `notifications.ts`, etc. re-export from services so existing route imports continue working.

## Configuration

- `backend/src/config/env.ts` — JWT secret, CORS origin
- `backend/src/config/paths.ts` — JSON file and upload directory paths
