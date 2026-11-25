import { RoomServiceClient } from 'livekit-server-sdk';
import {
  buildLiveKitRoomName,
  getLiveKitApiCredentials,
  getLiveKitApiHost,
  isLiveKitConfigured,
} from '@/config/livekit';

let roomClient: RoomServiceClient | null = null;

function getRoomServiceClient(): RoomServiceClient {
  if (!roomClient) {
    const { apiKey, apiSecret } = getLiveKitApiCredentials();
    roomClient = new RoomServiceClient(getLiveKitApiHost(), apiKey, apiSecret);
  }
  return roomClient;
}

export function resolveMeetingLiveKitRoomName(meetingId: string, storedName?: string): string {
  return storedName?.trim() || buildLiveKitRoomName(meetingId);
}

/** Idempotent room create for an approval meeting. */
export async function ensureLiveKitRoomForMeeting(
  meetingId: string,
  storedRoomName?: string,
): Promise<string> {
  if (!isLiveKitConfigured()) {
    throw new Error('LiveKit is not configured on this server');
  }

  const roomName = resolveMeetingLiveKitRoomName(meetingId, storedRoomName);
  const client = getRoomServiceClient();

  try {
    await client.createRoom({
      name: roomName,
      emptyTimeout: 15 * 60,
      departureTimeout: 30,
      maxParticipants: 12,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (!message.toLowerCase().includes('already exists')) {
      throw err instanceof Error ? err : new Error(message);
    }
  }

  return roomName;
}