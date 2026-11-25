# Daros Live — Approval Meetings (Phase 1)

Daros Live adds **live collaborative review** alongside the existing **Standard Approval** workflow. Phase 1: meetings API + data. Phase 2: LiveKit Cloud A/V (see `docs/deployment/livekit-cloud.md`).

## Tables (Supabase)

Run `backend/supabase/patch-approval-meetings.sql` on existing projects, or use full `backend/supabase/schema.sql` for new installs.

| Table | Purpose |
| ----- | ------- |
| `approval_meetings` | Scheduled live sessions bound to `documents.id` + `document_version` |
| `meeting_decisions` | One decision row per meeting (`pending` → `reviewed` / `approved` / `rejected` in later phases) |

Relational columns enforce **foreign keys** to `documents` and between `meeting_decisions.meeting_id` → `approval_meetings.id`. Full records are duplicated in `body` jsonb (same pattern as other Daros entities).

### Meeting statuses

`scheduled` → `in_progress` → `completed` | `cancelled`

Ending a meeting **does not** approve the document.

### Decision statuses (Phase 1)

Created as `pending`. Status updates arrive in a later phase when live actions call the standard review/approve APIs.

## RLS

Identical to other Daros tables: **RLS enabled**, `anon` / `authenticated` **revoked**, **service_role only** policy. The React app never accesses these tables directly; the Next.js API uses the service role key.

## LiveKit (Phase 2)

- Token: `POST /api/approval-meetings/:id/livekit-token`
- Setup: [livekit-cloud.md](../deployment/livekit-cloud.md)

## Meeting UI (Phase 3)

Full-screen **Daros Live** workspace inside the dashboard (portal overlay):

- **Main:** shared document via `DocumentFilePreview` / PDF page navigation
- **Right:** participant video tiles, roles (from LiveKit metadata), connection quality
- **Bottom:** microphone, camera, screen share, leave
- **Header:** Daros Live branding, document title, meeting status, duration timer

Entry: **New Document → Live Cycle → Live meeting test → Join with LiveKit**.

## Collaborative document viewer (Phase 5)

During a **Daros Live** session, participants view the **same PDF** loaded through the existing authenticated `GET /api/documents/:id/file` path (no duplicate storage).

- **PDF only** in the meeting UI; other formats show an explanatory message (no ad-hoc download link).
- **Version binding:** `documentVersion` and `contentFingerprint` from the meeting record; mismatches block viewing and warn if the file changed after scheduling.
- **Page sync:** LiveKit **reliable data messages** on topic `daros-doc-viewer` (already connected for A/V). Supabase Realtime is not used in the SPA; the meeting room is the sync channel.
- **Navigation control:** **Author** and **Reviewer** can change pages; **Approver** follows. Canvas rendering only in-meeting (no “open file” affordance).

Local check: `node scripts/test-document-viewer-sync.mjs` (three-participant message simulation).

## Live approval decisions (Phase 6)

Server endpoints (auth + role enforced):

| Method | Path | Actor |
| ------ | ---- | ----- |
| `POST` | `/api/approval-meetings/:id/review` | Assigned reviewer |
| `POST` | `/api/approval-meetings/:id/approve` | Assigned approver (after review) |
| `POST` | `/api/approval-meetings/:id/reject` | Assigned approver (reason required) |

Calls **`markDocumentReviewed`**, **`finalizeDocumentApproval`** (same as standard PUT approve), and **`rejectDocumentForApproval`**. Meeting must be **`in_progress`**; document version + fingerprint must match the meeting record. `meeting_decisions` transitions use compare-and-set on status to reduce races.

On join, the meeting client auto-calls **`POST …/start`** when still `scheduled`, and submits the document for review if `approvalWorkflow === live` and not yet submitted.

Participants see updates via LiveKit topic `daros-live-decision` plus API refresh.

Local check: `npm run test:live-approval` (`scripts/test-live-approval-workflow.mjs`).

## Notifications & history (Phase 7)

| Scenario | Channel | Notes |
| -------- | ------- | ----- |
| Meeting scheduled | `live_meeting_invitation` | Reviewer + approver; includes title, date/time, join hint + `approvalMeetingId` |
| Meeting rescheduled | `live_meeting_rescheduled` | All participants (`POST …/reschedule`) |
| Meeting cancelled | `live_meeting_cancelled` | All participants |
| Host ends incomplete session | `live_meeting_ended` | All participants |
| Review in live session | `document_reviewed` | Author |
| Approve / reject in live | `document_approved` / `document_rejected` | Author |

Audit / timeline: `approval_meeting_*` events (including `rescheduled`, `reviewed`, incomplete `ended`) appear in **review history** and on the document detail **Daros Live meetings** panel (`GET /api/documents/:id/approval-meetings` — participant-only).

Invitations are idempotent via `invitationsSentAt` on create; reschedules send a single reschedule notification per API call.

Local check: `npm run test:live-notifications`.

## Scheduling & invitations (Phase 4)

On **New Document**, authors choose **Standard Approval** (unchanged) or **Live Approval**. Live submit:

1. Creates the document and file version
2. `POST /api/approval-meetings` with title, schedule, `clientSubmissionKey` (idempotent retries)
3. Sets `documents.approvalWorkflow = live` and `activeApprovalMeetingId`
4. Sends **in-app** `live_meeting_invitation` notifications (reviewer + approver)

Participants open the notification → authenticated **Daros Live** join screen → LiveKit token.

**Email:** not wired in this repo. Invitations are Daros notification records only. To add email, configure SMTP/Resend (or similar) and call it from `liveMeetingInvitationService.ts` alongside `createNotification`.

## API

| Method | Path | Description |
| ------ | ---- | ----------- |
| `POST` | `/api/approval-meetings` | Schedule meeting (author only) |
| `GET` | `/api/approval-meetings?documentId=` | List meetings for a document |
| `GET` | `/api/approval-meetings/:id` | Meeting + decision + role summary |
| `POST` | `/api/approval-meetings/:id/start` | `scheduled` → `in_progress` |
| `POST` | `/api/approval-meetings/:id/end` | `in_progress` → `completed` (host) |
| `POST` | `/api/approval-meetings/:id/cancel` | → `cancelled` (host) |
| `POST` | `/api/approval-meetings/:id/livekit-token` | Mint LiveKit JWT (participants only) |
| `POST` | `/api/approval-meetings/:id/livekit-token` | LiveKit JWT (participants only) |

## Audit

Document events: `approval_meeting_scheduled`, `approval_meeting_started`, `approval_meeting_ended`, `approval_meeting_cancelled` with `metadata.approvalMeetingId`.

## Local JSON provider

When `DATABASE_PROVIDER` is not Supabase, data is stored in:

- `approval_meetings.json`
- `meeting_decisions.json`

under `DATA_DIR` (see `backend/src/config/paths.ts`).