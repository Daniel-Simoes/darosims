export const LIVE_MEETING_DECISION_TOPIC = 'daros-live-decision';

export type LiveDecisionBroadcastV1 = {
  v: 1;
  type: 'decision';
  meetingId: string;
  decisionStatus: string;
  seq: number;
};

export function encodeDecisionBroadcast(message: LiveDecisionBroadcastV1): Uint8Array {
  return new TextEncoder().encode(JSON.stringify(message));
}

export function parseDecisionBroadcast(payload: Uint8Array): LiveDecisionBroadcastV1 | null {
  try {
    const parsed = JSON.parse(new TextDecoder().decode(payload)) as LiveDecisionBroadcastV1;
    if (parsed?.v !== 1 || parsed.type !== 'decision') return null;
    return parsed;
  } catch {
    return null;
  }
}