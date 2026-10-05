# Documents Domain

## CURRENT capabilities

- Create internal/external documents
- Drafts, submit, approve, reject, resubmit
- Word/text source files → PDF on approval
- Document register, detail view, my drafts
- Rejection reason + upload replacement file

## Frontend

| Location | Responsibility |
|----------|----------------|
| `features/documents/components/` | UI views |
| `lib/documents/` | Status helpers, upload, content parsing |
| `lib/api/documents.ts` | API calls |
| `types/documents.ts` | DocumentRecord, payloads |

## Backend

| Location | Responsibility |
|----------|----------------|
| `services/documents/documentService.ts` | Business rules |
| `repositories/documents/documentRepository.ts` | JSON CRUD |
| `services/storage/storageService.ts` | File uploads |
| `app/api/documents/*` | HTTP routes |

## Conceptual model (future-ready)

| Concept | CURRENT | FUTURE |
|---------|---------|--------|
| Document | DocumentRecord in JSON | PostgreSQL `documents` table |
| Document Version | Single `version` field | Separate `document_versions` table |
| Workflow | status + submittedAt | Workflow state machine |
| Approval | approvedBy name | Approval records table |
| Files | Local uploads | Supabase Storage |
