export function isLiveKitConfigured(): boolean {
  const key = process.env.LIVEKIT_API_KEY?.trim();
  const secret = process.env.LIVEKIT_API_SECRET?.trim();
  const url = process.env.LIVEKIT_URL?.trim();
  return Boolean(key && secret && url);
}

export function getLiveKitPublicUrl(): string {
  const url = process.env.LIVEKIT_URL?.trim();
  if (!url) {
    throw new Error('LiveKit is not configured (missing LIVEKIT_URL)');
  }
  return url;
}

export function getLiveKitApiCredentials(): { apiKey: string; apiSecret: string } {
  const apiKey = process.env.LIVEKIT_API_KEY?.trim();
  const apiSecret = process.env.LIVEKIT_API_SECRET?.trim();
  if (!apiKey || !apiSecret) {
    throw new Error('LiveKit is not configured (missing LIVEKIT_API_KEY or LIVEKIT_API_SECRET)');
  }
  return { apiKey, apiSecret };
}

/** REST host for RoomServiceClient (wss:// → https://). */
export function getLiveKitApiHost(): string {
  const url = getLiveKitPublicUrl();
  if (url.startsWith('wss://')) return `https://${url.slice('wss://'.length)}`;
  if (url.startsWith('ws://')) return `http://${url.slice('ws://'.length)}`;
  if (url.startsWith('https://')) return url;
  throw new Error('LIVEKIT_URL must be a wss:// or https:// URL');
}

export function buildLiveKitRoomName(meetingId: string): string {
  const safe = meetingId.replace(/[^a-zA-Z0-9-]/g, '').slice(0, 64);
  return `daros-live-${safe}`;
}