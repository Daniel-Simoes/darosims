# Frontend Architecture

## CURRENT structure

```
src/
├── components/
│   ├── common/          # Shared UI (DarosEntryLoading)
│   ├── dialogs/       # ConfirmDialog, RejectDocumentDialog, UploadRejectedDocumentDialog
│   ├── home/          # Marketing homepage sections
│   └── layout/        # Navbar, Footer, MegaMenu
├── features/
│   ├── authentication/  # AuthContext, ProtectedRoute
│   ├── documents/       # Document register, detail, drafts, editor, preview
│   ├── notifications/   # Notifications list, history, header bell
│   ├── dashboard/       # Sidebar, charts, module views
│   ├── audit/           # Event label/formatting utilities
│   ├── permissions/     # Document permission helpers (barrel)
│   ├── users/           # Placeholder for future user management
│   └── companies/       # Placeholder for future multi-tenancy
├── pages/
│   ├── auth/            # SignInPage
│   ├── dashboard/       # DashboardPage (main app shell)
│   └── HomePage.tsx     # Marketing landing
├── lib/
│   ├── api/             # Domain-split API client
│   │   ├── client.ts    # fetch wrapper, token storage
│   │   ├── auth.ts
│   │   ├── documents.ts
│   │   ├── notifications.ts
│   │   ├── audit.ts
│   │   └── storage.ts
│   ├── documents/       # Document utilities (status, upload, content)
│   ├── permissions/     # canUserApproveDocuments, etc.
│   └── auth/            # Entry loading helpers
├── types/               # Shared TypeScript domain types
├── config/              # App configuration
└── data/                # Static config (sidebar, document types, etc.)
```

## Routing

React Router (`App.tsx`):

| Route | Page |
|-------|------|
| `/` | HomePage (marketing) |
| `/signin` | SignInPage |
| `/dashboard` | DashboardPage (protected) |

Dashboard navigation is **state-based** inside `DashboardPage` via `activeNav` — not nested routes.

## API usage

Components call `api` from `src/lib/api.ts` (barrel re-exporting domain modules).

Business logic belongs in `lib/` and `features/*/utils`, not in components.

## Backward compatibility

Shim files remain at old paths:

- `src/context/AuthContext.tsx`
- `src/lib/documentStatus.ts`, `documentUsers.ts`, etc.
- `src/pages/DashboardPage.tsx`

These re-export from the new locations.
