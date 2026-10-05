# Permissions Domain

## CURRENT

Simple permission checks — not full RBAC:

| Check | Location |
|-------|----------|
| Can approve documents | `lib/permissions/documentPermissions.ts` |
| Can delete document | Same file (creator or approver) |
| Is document owner | Same file |
| Backend approver check | `services/users/userService.isDocumentApprover` |

## FUTURE / PLANNED

Central authorization model:

```
User → Company → Role → Permissions
```

Planned permissions (defined in types, not yet enforced):

- view_documents, create_documents, edit_documents
- submit_documents, approve_documents, reject_documents
- manage_users, manage_companies, view_audit_logs

Do not scatter role checks in components — use `lib/permissions/` or a future `usePermission()` hook.
