# LiveKit Cloud (Daros Live — Phase 2)

Daros uses [LiveKit Cloud](https://livekit.io/) for real-time video in **approval meetings**. Tokens are minted **only** on the Next.js backend; API secrets never ship to the browser.

## 1. Create a LiveKit Cloud project

1. Sign up at [cloud.livekit.io](https://cloud.livekit.io/).
2. Create a project (note the **WebSocket URL**, e.g. `wss://your-project.livekit.cloud`).
3. Open **Settings → Keys** and create an API key pair.

## 2. Environment variables

Set on the **backend** (Vercel project for `backend/`, and `backend/.env.local` for local dev):

| Variable | Required | Description |
| -------- | -------- | ----------- |
| `LIVEKIT_API_KEY` | Yes | API key from LiveKit Cloud |
| `LIVEKIT_API_SECRET` | Yes | API secret (server only) |
| `LIVEKIT_URL` | Yes | WebSocket URL for clients, e.g. `wss://your-project.livekit.cloud` |

Do **not** prefix with `VITE_` or expose these in the React app.

## 3. Verify

1. Run `npm run dev:all`.
2. Ensure LiveKit env vars are in `backend/.env.local`.
3. Schedule an approval meeting (`POST /api/approval-meetings`).
4. Open **New Document → Live Cycle → Live meeting test**.
5. Host clicks **Start meeting**, each participant pastes the same meeting id and **Join with LiveKit**.

If LiveKit is not configured, `POST /api/approval-meetings/:id/livekit-token` returns **503**.

## 4. Room naming

Each meeting uses `daros-live-{meetingId}` (stored on `approval_meetings.body.livekitRoomName`). Rooms are created server-side before tokens are issued.

## 5. Permissions

Only **author**, **reviewer**, and **approver** on the meeting may receive a token. Standard document visibility rules still apply.

See also `docs/domains/daros-live.md`.