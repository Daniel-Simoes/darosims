# Storage Architecture

## CURRENT

Local filesystem storage in `backend/data/uploads/`:

| Pattern | Content |
|---------|---------|
| `{documentId}.pdf` | Published PDF |
| `{documentId}.source.docx` | Word source |
| `{documentId}.source.txt` | Text source |

Accessed via `repositories/storage/fileStorageRepository.ts` and `services/storage/storageService.ts`.

Frontend uploads use multipart FormData to `/api/documents/[id]/file` and `/source`.

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
