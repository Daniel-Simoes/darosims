# Authentication Domain

## CURRENT

- JWT signed with HS256 (`jose` library)
- Users stored in `backend/data/users.json`
- Demo users: daniel@darosapp.com, rodrigo@daros.com
- Frontend: `AuthContext`, `ProtectedRoute`, entry loading overlay
- Token key: `daros_auth_token` in localStorage

## Files

| Layer | Path |
|-------|------|
| Frontend context | `features/authentication/context/AuthContext.tsx` |
| Frontend guard | `features/authentication/components/ProtectedRoute.tsx` |
| API client | `lib/api/auth.ts` |
| Backend routes | `app/api/auth/login`, `app/api/auth/me` |
| Backend service | `services/users/userService.ts` (validateCredentials) |
| JWT helpers | `lib/auth.ts` |

## FUTURE / PLANNED

- Supabase Auth
- Session refresh tokens
- Company-scoped user accounts
- OAuth providers
