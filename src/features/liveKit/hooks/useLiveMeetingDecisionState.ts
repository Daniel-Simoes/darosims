import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RoomEvent } from 'livekit-client';
import { useLocalParticipant, useParticipants, useRoomContext } from '@livekit/components-react';
import { approvalMeetingsApi } from '../../../lib/api/approvalMeetings';
import { api } from '../../../lib/api';
import type { ApprovalMeetingRecord, MeetingDecisionRecord } from '../../../types/approvalMeetings';
import { parseLiveKitParticipantMetadata } from '../utils/participantRole';
import {
  LIVE_MEETING_DECISION_TOPIC,
  encodeDecisionBroadcast,
  parseDecisionBroadcast,
} from '../documentViewerSync/decisionSync';
import {
  buildLiveWorkflowStatusLabel,
  getConnectedWorkflowRoles,
  missingWorkflowRoles,
} from '../utils/liveMeetingWorkflowUi';

export function useLiveMeetingDecisionState(meetingId: string) {
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const participants = useParticipants();
  const role = parseLiveKitParticipantMetadata(localParticipant?.metadata).role;

  const [meeting, setMeeting] = useState<ApprovalMeetingRecord | null>(null);
  const [decision, setDecision] = useState<MeetingDecisionRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionBusy, setActionBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const broadcastSeq = useRef(0);

  const connectedRoles = useMemo(() => getConnectedWorkflowRoles(participants), [participants]);
  const missingRoles = useMemo(() => missingWorkflowRoles(connectedRoles), [connectedRoles]);
  const allParticipantsPresent = missingRoles.length === 0;

  const refresh = useCallback(async () => {
    const bundle = await approvalMeetingsApi.getMeeting(meetingId);
    setMeeting(bundle.meeting);
    setDecision(bundle.decision);
    return bundle;
  }, [meetingId]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    void refresh()
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : 'Could not load meeting decisions');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [refresh]);

  const publishDecisionBroadcast = useCallback(
    (decisionStatus: string) => {
      if (!room?.localParticipant) return;
      broadcastSeq.current += 1;
      const bytes = encodeDecisionBroadcast({
        v: 1,
        type: 'decision',
        meetingId,
        decisionStatus,
        seq: broadcastSeq.current,
      });
      const payload = new Uint8Array(bytes);
      void room.localParticipant.publishData(payload, {
        reliable: true,
        topic: LIVE_MEETING_DECISION_TOPIC,
      });
    },
    [meetingId, room],
  );

  useEffect(() => {
    if (!room) return;
    const onData = (payload: Uint8Array, _participant?: unknown, _kind?: unknown, topic?: string) => {
      if (topic !== LIVE_MEETING_DECISION_TOPIC) return;
      const message = parseDecisionBroadcast(payload);
      if (!message || message.meetingId !== meetingId) return;
      void refresh().catch(() => undefined);
    };
    room.on(RoomEvent.DataReceived, onData);
    return () => {
      room.off(RoomEvent.DataReceived, onData);
    };
  }, [meetingId, refresh, room]);

  const ensureMeetingStarted = useCallback(async () => {
    const bundle = await refresh();
    if (bundle.meeting.status === 'scheduled') {
      const { meeting: started } = await approvalMeetingsApi.startMeeting(meetingId);
      setMeeting(started);
    }
  }, [meetingId, refresh]);

  useEffect(() => {
    void ensureMeetingStarted().catch(() => undefined);
  }, [ensureMeetingStarted]);

  const runReview = useCallback(async () => {
    setActionBusy(true);
    setError(null);
    try {
      const result = await approvalMeetingsApi.reviewInMeeting(meetingId);
      setMeeting(result.meeting);
      setDecision(result.decision);
      publishDecisionBroadcast(result.decision.status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Review failed');
      throw err;
    } finally {
      setActionBusy(false);
    }
  }, [meetingId, publishDecisionBroadcast]);

  const runApprove = useCallback(async () => {
    setActionBusy(true);
    setError(null);
    try {
      const result = await approvalMeetingsApi.approveInMeeting(meetingId);
      setMeeting(result.meeting);
      setDecision(result.decision);
      publishDecisionBroadcast(result.decision.status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Approval failed');
      throw err;
    } finally {
      setActionBusy(false);
    }
  }, [meetingId, publishDecisionBroadcast]);

  const runReject = useCallback(
    async (reason: string) => {
      setActionBusy(true);
      setError(null);
      try {
        const result = await approvalMeetingsApi.rejectInMeeting(meetingId, reason);
        setMeeting(result.meeting);
        setDecision(result.decision);
        publishDecisionBroadcast(result.decision.status);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Rejection failed');
        throw err;
      } finally {
        setActionBusy(false);
      }
    },
    [meetingId, publishDecisionBroadcast],
  );

  const runRejectReview = useCallback(
    async (reason: string) => {
      if (!meeting) return;
      setActionBusy(true);
      setError(null);
      try {
        await api.rejectDocumentForApproval(meeting.documentId, reason);
        await refresh();
        publishDecisionBroadcast('rejected');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not reject review');
        throw err;
      } finally {
        setActionBusy(false);
      }
    },
    [meeting, publishDecisionBroadcast, refresh],
  );

  const runFinishCycle = useCallback(async () => {
    setActionBusy(true);
    setError(null);
    try {
      const bundle = await refresh();
      if (bundle.meeting.status === 'in_progress') {
        const result = await approvalMeetingsApi.endMeeting(meetingId);
        setMeeting(result.meeting);
      }
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not finish cycle');
      throw err;
    } finally {
      setActionBusy(false);
    }
  }, [meetingId, refresh]);

  const focusDocumentPane = useCallback(() => {
    const pane = window.document.querySelector('.dl-document-pane');
    if (pane instanceof HTMLElement) {
      pane.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      pane.focus({ preventScroll: true });
    }
  }, []);

  const meetingLive = meeting?.status === 'in_progress';
  const showWorkflowActions = allParticipantsPresent && meetingLive;

  const statusLabel = buildLiveWorkflowStatusLabel({
    loading,
    decision,
    allPresent: allParticipantsPresent,
    missing: missingRoles,
  });

  const canApproveReview =
    showWorkflowActions && role === 'reviewer' && decision?.status === 'pending';
  const canRejectReview = canApproveReview;

  const canApproveDocument =
    showWorkflowActions && role === 'approver' && decision?.status === 'reviewed';
  const canRejectDocument = canApproveDocument;

  const showAuthorDocument =
    showWorkflowActions &&
    role === 'author' &&
    (decision?.status === 'pending' || decision?.status === 'reviewed');

  const canFinishCycle =
    allParticipantsPresent && role === 'author' && decision?.status === 'approved';

  return {
    meeting,
    decision,
    loading,
    actionBusy,
    error,
    statusLabel,
    role,
    allParticipantsPresent,
    missingRoles,
    canApproveReview,
    canRejectReview,
    canApproveDocument,
    canRejectDocument,
    showAuthorDocument,
    canFinishCycle,
    runReview,
    runApprove,
    runReject,
    runRejectReview,
    runFinishCycle,
    focusDocumentPane,
    refresh,
  };
}