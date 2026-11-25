import { useCallback, useRef, useState } from 'react';
import { DisconnectReason } from 'livekit-client';
import type { ApprovalMeetingRecord } from '../../../types/approvalMeetings';
import { approvalMeetingsApi, type LiveKitTokenResponse } from '../../../lib/api/approvalMeetings';

export type LiveKitSessionPhase =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'disconnected'
  | 'error';

type Credentials = Pick<LiveKitTokenResponse, 'token' | 'serverUrl' | 'roomName' | 'role' | 'expiresAt'>;

export function useLiveKitMeetingSession() {
  const meetingIdRef = useRef<string | null>(null);
  const [phase, setPhase] = useState<LiveKitSessionPhase>('idle');
  const [credentials, setCredentials] = useState<Credentials | null>(null);
  const [meeting, setMeeting] = useState<ApprovalMeetingRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [disconnectReason, setDisconnectReason] = useState<string | null>(null);

  const loadToken = useCallback(async (meetingId: string) => {
    const response = await approvalMeetingsApi.fetchLiveKitToken(meetingId);
    return {
      token: response.token,
      serverUrl: response.serverUrl,
      roomName: response.roomName,
      role: response.role,
      expiresAt: response.expiresAt,
    } satisfies Credentials;
  }, []);

  const joinMeeting = useCallback(
    async (meetingId: string) => {
      meetingIdRef.current = meetingId.trim();
      setError(null);
      setDisconnectReason(null);
      setPhase('connecting');
      try {
        const creds = await loadToken(meetingIdRef.current);
        const bundle = await approvalMeetingsApi.getMeeting(meetingIdRef.current);
        setMeeting(bundle.meeting);
        setCredentials(creds);
        setPhase('connected');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Could not join the live meeting';
        setError(message);
        setCredentials(null);
        setMeeting(null);
        setPhase('error');
      }
    },
    [loadToken],
  );

  const leaveMeeting = useCallback(() => {
    meetingIdRef.current = null;
    setCredentials(null);
    setMeeting(null);
    setPhase('disconnected');
    setDisconnectReason(null);
  }, []);

  const handleRoomDisconnected = useCallback((reason?: DisconnectReason) => {
    setCredentials(null);
    setMeeting(null);
    if (reason === DisconnectReason.CLIENT_INITIATED) {
      setPhase('disconnected');
      setDisconnectReason(null);
      return;
    }
    const label =
      reason === DisconnectReason.SERVER_SHUTDOWN
        ? 'The media server closed the connection.'
        : reason === DisconnectReason.PARTICIPANT_REMOVED
          ? 'You were removed from the meeting.'
          : reason === DisconnectReason.ROOM_DELETED
            ? 'The meeting room was closed.'
            : 'The live connection was interrupted.';
    setDisconnectReason(label);
    setPhase('disconnected');
  }, []);

  const reconnect = useCallback(async () => {
    const meetingId = meetingIdRef.current;
    if (!meetingId) return;
    setPhase('reconnecting');
    setError(null);
    try {
      const creds = await loadToken(meetingId);
      const bundle = await approvalMeetingsApi.getMeeting(meetingId);
      setMeeting(bundle.meeting);
      setCredentials(creds);
      setDisconnectReason(null);
      setPhase('connected');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not reconnect';
      setError(message);
      setPhase('error');
    }
  }, [loadToken]);

  return {
    phase,
    credentials,
    meeting,
    error,
    disconnectReason,
    joinMeeting,
    leaveMeeting,
    reconnect,
    handleRoomDisconnected,
  };
}