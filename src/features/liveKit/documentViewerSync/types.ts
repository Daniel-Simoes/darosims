export const LIVE_MEETING_DOC_VIEWER_TOPIC = 'daros-doc-viewer';

export type DocumentViewerSyncMessageV1 =
  | {
      v: 1;
      type: 'page';
      meetingId: string;
      documentId: string;
      documentVersion: number;
      page: number;
      seq: number;
      senderId: string;
    }
  | {
      v: 1;
      type: 'state';
      meetingId: string;
      documentId: string;
      documentVersion: number;
      page: number;
      seq: number;
      senderId: string;
    }
  | {
      v: 1;
      type: 'request';
      meetingId: string;
      documentId: string;
      documentVersion: number;
      senderId: string;
    };

export function parseDocumentViewerMessage(payload: Uint8Array): DocumentViewerSyncMessageV1 | null {
  try {
    const text = new TextDecoder().decode(payload);
    const parsed = JSON.parse(text) as DocumentViewerSyncMessageV1;
    if (parsed?.v !== 1) return null;
    if (!parsed.meetingId || !parsed.documentId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function encodeDocumentViewerMessage(message: DocumentViewerSyncMessageV1): Uint8Array {
  return new TextEncoder().encode(JSON.stringify(message));
}

/** Applies a remote update; returns next page and whether seq was accepted. */
export function applyRemoteDocumentViewerMessage(
  message: DocumentViewerSyncMessageV1,
  context: {
    meetingId: string;
    documentId: string;
    documentVersion: number;
    lastSeq: number;
    currentPage: number;
  },
): { page: number; lastSeq: number; accepted: boolean } {
  if (message.meetingId !== context.meetingId) {
    return { page: context.currentPage, lastSeq: context.lastSeq, accepted: false };
  }
  if (message.documentId !== context.documentId) {
    return { page: context.currentPage, lastSeq: context.lastSeq, accepted: false };
  }
  if (message.documentVersion !== context.documentVersion) {
    return { page: context.currentPage, lastSeq: context.lastSeq, accepted: false };
  }

  if (message.type === 'request') {
    return { page: context.currentPage, lastSeq: context.lastSeq, accepted: false };
  }

  if (message.seq <= context.lastSeq) {
    return { page: context.currentPage, lastSeq: context.lastSeq, accepted: false };
  }

  return {
    page: Math.max(0, Math.trunc(message.page)),
    lastSeq: message.seq,
    accepted: true,
  };
}