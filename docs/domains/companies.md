# Companies Domain

## CURRENT

**Not implemented.** Placeholder structure only:

- `src/features/companies/index.ts`
- `src/types/auth.ts` (Company interface)
- `backend/src/types/permissions.ts`

## FUTURE / PLANNED

Multi-tenant SaaS model:

```
Organization (Company)
  └── Users
       └── Roles
            └── Permissions
```

Documents and audit logs will be scoped by `companyId`.
