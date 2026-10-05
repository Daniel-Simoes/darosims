# Users Domain

## CURRENT

- Users stored in JSON (`backend/data/users.json`)
- Used for login and document owner/approver lookup
- Frontend hardcoded `DOCUMENT_USERS` for owner dropdowns

## Files

- `repositories/users/userRepository.ts`
- `services/users/userService.ts`
- `lib/permissions/documentPermissions.ts` (frontend role checks)

## FUTURE / PLANNED

- `features/users/` for user management UI
- Company-scoped users
- Invitation flow
- Profile management
