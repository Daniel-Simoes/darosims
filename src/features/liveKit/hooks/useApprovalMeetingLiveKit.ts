import { useCallback, useEffect, useRef, useState } from 'react';
import { ConnectionState } from 'livekit-client';
import { approvalMeetingsApi, type LiveKitTokenResponse } from '../../../lib/api/approvalMeetings';

export type LiveKitSessionState = {
  credentials: LiveKitTokenResponse | null;
  connectionState: ConnectionState | 'idle' | 'fetching';
  error: string | null;
  isConnected: boolean;
};

export function useApprovalMeetingLiveKit(meetingId: string | null) {
  const [credentials, setCredentials] = useState<LiveKitTokenResponse | null>(null);
  const [connectionState, setConnectionState] = useState<LiveKitSessionState['connectionState']>('idle');
  const [error, setError] = useState<string | null>(null);
  const [shouldConnect, setShouldConnect] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchToken = useCallback(async () => {
    if (!meetingId?.trim()) {
      setError('Meeting id is required');
      return null;
    }
    setConnectionState('fetching');
    setError(null);
    try {
      const result = await approvalMeetingsApi.fetchLiveKitToken(meetingId.trim());
      if (!mountedRef.current) return null;
      setCredentials(result);
      setConnectionState('idle');
      return result;
    } catch (err) {
      if (!mountedRef.current) return null;
      const message = err instanceof Error ? err.message : 'Failed to get LiveKit token';
      setError(message);
      setConnectionState('idle');
      return null;
    }
  }, [meetingId]);

  const join = useCallback(async () => {
    const token = credentials ?? (await fetchToken());
    if (!token) return false;
    setShouldConnect(true);
    return true;
  }, [credentials, fetchToken]);

  const leave = useCallback(() => {
    setShouldConnect(false);
    setConnectionState('idle');
  }, []);

  const reconnect = useCallback(async () => {
    setShouldConnect(false);
    const fresh = await fetchToken();
    if (fresh) {
      setShouldConnect(true);
    }
  }, [fetchToken]);

  const onLiveKitConnectionState = useCallback((state: ConnectionState) => {
    setConnectionState(state);
    if (state === ConnectionState.Disconnected && shouldConnect) {
      setError('Connection interrupted. You can try reconnecting.');
      setShouldConnect(false);
    }
  }, [shouldConnect]);

  return {
    credentials,
    shouldConnect,
    connectionState,
    error,
    isConnected: connectionState === ConnectionState.Connected,
    fetchToken,
    join,
    leave,
    reconnect,
    onLiveKitConnectionState,
    setError,
  };
}