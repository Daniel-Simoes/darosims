# Storage Architecture

## CURRENT

Local filesystem storage in `backend/data/uploads/`:

| Pattern | Content |
|---------|---------|
| `{documentId}.pdf` | Document PDF (draft or published) |
| `{documentId}.source.*` | Legacy Word/text sources (read-only; new uploads use PDF) |

Accessed via `repositories/storage/fileStorageRepository.ts` and `services/storage/storageService.ts`.

Frontend uploads use multipart FormData to `/api/documents/[id]/file`.

## Separation from document logic

Document **business rules** live in `documentService`.
File **I/O** lives in `fileStorageRepository` / `storageService`.

This allows swapping storage backends without changing the approval workflow.

## FUTURE / PLANNED

Replace with Supabase Storage:

```
services/storage/storageService.ts  → unchanged interface
repositories/storage/supabaseStorageRepository.ts  → new implementation
```

Planned areas:

```
supabase/
├── storage/     # Bucket policies
├── auth/        # Auth config
└── migrations/  # Schema migrations
```

**Not connected yet** — no Supabase packages installed.
