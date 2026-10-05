# Audit / Document Events Domain

## CURRENT

Append-only document event log in `backend/data/document_events.json`.

Event types: `created`, `submitted`, `resubmitted`, `rejected`, `edited`, `approved`

Used by the **Notification History** screen to show document lifecycle timelines.

## Files

| Layer | Path |
|-------|------|
| UI | `features/notifications/components/NotificationHistoryView.tsx` |
| Labels | `features/audit/utils/eventLabels.ts` |
| API | `lib/api/audit.ts` |
| Service | `services/audit/documentEventService.ts` |
| Repository | `repositories/audit/documentEventRepository.ts` |

Events are recorded automatically in document lifecycle routes.

Legacy data is backfilled from existing notifications on first read.

## FUTURE / PLANNED

Expand to full audit log with types like:

`DOCUMENT_CREATED`, `USER_UPDATED`, `ROLE_CHANGED`, `PERMISSION_CHANGED`, etc.

See `backend/src/types/audit.ts` for planned `AuditEventType` enum.
