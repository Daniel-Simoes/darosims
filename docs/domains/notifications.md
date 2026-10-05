# Notifications Domain

## CURRENT

In-app notifications for document workflow events:

| Type | Trigger |
|------|---------|
| `approval_request` | Document submitted |
| `document_rejected` | Approver rejects with reason |
| `document_approved` | Document approved |

Stored in `backend/data/notifications.json`, scoped per `recipientEmail`.

## Files

| Layer | Path |
|-------|------|
| UI | `features/notifications/components/` |
| Formatters | `features/notifications/utils/formatters.ts` |
| API | `lib/api/notifications.ts` |
| Service | `services/notifications/notificationService.ts` |
| Repository | `repositories/notifications/notificationRepository.ts` |

## Related: Notification History

Audit-style timelines use `document_events.json` — see `docs/domains/audit.md`.
