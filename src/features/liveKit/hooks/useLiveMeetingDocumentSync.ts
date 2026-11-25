import { useCallback, useEffect, useRef, useState } from 'react';
import { RoomEvent, type RemoteParticipant } from 'livekit-client';
import { useLocalParticipant, useRoomContext } from '@livekit/components-react';
import type { ApprovalMeetingParticipantRole } from '../../../types/approvalMeetings';
import {
  LIVE_MEETING_DOC_VIEWER_TOPIC,
  applyRemoteDocumentViewerMessage,
  encodeDocumentViewerMessage,
  parseDocumentViewerMessage,
  type DocumentViewerSyncMessageV1,
} from '../documentViewerSync/types';

export type DocumentSyncMode = 'control' | 'follow';

function canRoleControlDocument(role: ApprovalMeetingParticipantRole | undefined): boolean {
  return role === 'author' || role === 'reviewer';
}

export function useLiveMeetingDocumentSync(options: {
  meetingId: string;
  documentId: string;
  documentVersion: number;
  participantRole: ApprovalMeetingParticipantRole | undefined;
  enabled: boolean;
}) {
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const identity = localParticipant?.identity ?? 'unknown';

  const canControl = canRoleControlDocument(options.participantRole);
  const mode: DocumentSyncMode = canControl ? 'control' : 'follow';

  const [pageIndex, setPageIndexState] = useState(0);
  const seqRef = useRef(0);
  const lastAppliedSeqRef = useRef(0);
  const pageRef = useRef(0);

  const publish = useCallback(
    (message: DocumentViewerSyncMessageV1) => {
      if (!room?.localParticipant) return;
      const bytes = encodeDocumentViewerMessage(message);
      const payload = new Uint8Array(bytes);
      void room.localParticipant.publishData(payload, {
        reliable: true,
        topic: LIVE_MEETING_DOC_VIEWER_TOPIC,
      });
    },
    [room],
  );

  const broadcastState = useCallback(() => {
    seqRef.current += 1;
    publish({
      v: 1,
      type: 'state',
      meetingId: options.meetingId,
      documentId: options.documentId,
      documentVersion: options.documentVersion,
      page: pageRef.current,
      seq: seqRef.current,
      senderId: identity,
    });
  }, [identity, options.documentId, options.documentVersion, options.meetingId, publish]);

  const setPageIndex = useCallback(
    (next: number) => {
      if (!canControl || !options.enabled) return;
      const clamped = Math.max(0, Math.trunc(next));
      pageRef.current = clamped;
      setPageIndexState(clamped);
      seqRef.current += 1;
      publish({
        v: 1,
        type: 'page',
        meetingId: options.meetingId,
        documentId: options.documentId,
        documentVersion: options.documentVersion,
        page: clamped,
        seq: seqRef.current,
        senderId: identity,
      });
    },
    [
      canControl,
      identity,
      options.documentId,
      options.documentVersion,
      options.enabled,
      options.meetingId,
      publish,
    ],
  );

  useEffect(() => {
    pageRef.current = pageIndex;
  }, [pageIndex]);

  useEffect(() => {
    if (!room || !options.enabled) return;

    const onData = (
      payload: Uint8Array,
      participant?: RemoteParticipant,
      _kind?: unknown,
      topic?: string,
    ) => {
      if (topic !== LIVE_MEETING_DOC_VIEWER_TOPIC) return;
      const message = parseDocumentViewerMessage(payload);
      if (!message) return;

      if (message.type === 'request' && canControl) {
        broadcastState();
        return;
      }

      const result = applyRemoteDocumentViewerMessage(message, {
        meetingId: options.meetingId,
        documentId: options.documentId,
        documentVersion: options.documentVersion,
        lastSeq: lastAppliedSeqRef.current,
        currentPage: pageRef.current,
      });

      if (!result.accepted) return;

      if (
        canControl &&
        message.type === 'page' &&
        participant &&
        participant.identity !== identity
      ) {
        // Another controller moved the page — followers and other controllers stay in sync.
      }

      lastAppliedSeqRef.current = result.lastSeq;
      pageRef.current = result.page;
      setPageIndexState(result.page);
    };

    room.on(RoomEvent.DataReceived, onData);
    return () => {
      room.off(RoomEvent.DataReceived, onData);
    };
  }, [
    broadcastState,
    canControl,
    identity,
    options.documentId,
    options.documentVersion,
    options.enabled,
    options.meetingId,
    room,
  ]);

  useEffect(() => {
    if (!room || !options.enabled) return;

    const timer = window.setTimeout(() => {
      if (canControl) {
        broadcastState();
      } else {
        publish({
          v: 1,
          type: 'request',
          meetingId: options.meetingId,
          documentId: options.documentId,
          documentVersion: options.documentVersion,
          senderId: identity,
        });
      }
    }, 600);

    return () => window.clearTimeout(timer);
  }, [
    broadcastState,
    canControl,
    identity,
    options.documentId,
    options.documentVersion,
    options.enabled,
    options.meetingId,
    publish,
    room,
  ]);

  return {
    pageIndex,
    setPageIndex,
    canControl,
    mode,
  };
}