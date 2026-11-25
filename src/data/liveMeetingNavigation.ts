export const LIVE_MEETING_NAV_PREFIX = 'live-meeting-';

export function getLiveMeetingViewId(meetingId: string) {
  return `${LIVE_MEETING_NAV_PREFIX}${meetingId}`;
}

export function parseLiveMeetingViewId(activeNav: string): string | null {
  if (!activeNav.startsWith(LIVE_MEETING_NAV_PREFIX)) return null;
  const id = activeNav.slice(LIVE_MEETING_NAV_PREFIX.length).trim();
  return id || null;
}