# Data Flow

## Document lifecycle (CURRENT)

```
Create document
  → documentService.createDocument()
  → documentEventService (created)
  → JSON: documents.json

Submit for approval
  → documentService.submitDocumentForApproval()
  → notificationService (approval_request to owner)
  → documentEventService (submitted | resubmitted)

Reject
  → documentService.rejectDocumentForApproval()
  → notificationService (document_rejected to creator)
  → documentEventService (rejected + reason)

Edit / upload new file
  → documentService.updateDocument()
  → storageService (file upload)
  → documentEventService (edited)

Approve
  → documentService.updateDocument(status: Active)
  → storageService (PDF publish, delete source)
  → notificationService (document_approved)
  → documentEventService (approved)
```

## Notification history

`GET /api/document-events` reads from `document_events.json` via `documentEventRepository`, grouped by document into timelines for the Notification History screen.

## Auth flow

```
POST /api/auth/login → validateCredentials → signToken (JWT)
GET  /api/auth/me    → verifyToken → return user

Frontend stores token in localStorage, sends Bearer header on all API calls.
```
