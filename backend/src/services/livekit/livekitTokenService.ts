import { AccessToken } from 'livekit-server-sdk';
import type { VideoGrant } from 'livekit-server-sdk';
import {
  getLiveKitApiCredentials,
  getLiveKitPublicUrl,
  isLiveKitConfigured,
} from '@/config/livekit';
import type { ApprovalMeetingParticipantRole } from '@/types';

const TOKEN_TTL_SEC = 60 * 60;

export type LiveKitParticipantTokenInput = {
  roomName: string;
  identity: string;
  displayName: string;
  role: ApprovalMeetingParticipantRole;
  meetingId: string;
  documentId: string;
};

function videoGrantForRole(roomName: string, role: ApprovalMeetingParticipantRole): VideoGrant {
  const base: VideoGrant = {
    roomJoin: true,
    room: roomName,
    canSubscribe: true,
    canPublish: true,
    canPublishData: true,
  };

  if (role === 'author') {
    return {
      ...base,
      roomAdmin: true,
      canUpdateOwnMetadata: true,
    };
  }

  return {
    ...base,
    canUpdateOwnMetadata: true,
  };
}

export async function issueLiveKitParticipantToken(
  input: LiveKitParticipantTokenInput,
): Promise<{ token: string; expiresAt: string; serverUrl: string }> {
  if (!isLiveKitConfigured()) {
    throw new Error('LiveKit is not configured on this server');
  }

  const { apiKey, apiSecret } = getLiveKitApiCredentials();
  const grant = videoGrantForRole(input.roomName, input.role);

  const at = new AccessToken(apiKey, apiSecret, {
    identity: input.identity,
    name: input.displayName,
    ttl: TOKEN_TTL_SEC,
    metadata: JSON.stringify({
      role: input.role,
      meetingId: input.meetingId,
      documentId: input.documentId,
    }),
  });

  at.addGrant(grant);

  const expiresAt = new Date(Date.now() + TOKEN_TTL_SEC * 1000).toISOString();

  return {
    token: await at.toJwt(),
    expiresAt,
    serverUrl: getLiveKitPublicUrl(),
  };
}