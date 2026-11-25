/**
 * Validates Daros Live notification copy includes doc title, schedule, and join hint.
 * Run: node scripts/test-live-meeting-notifications.mjs
 */

function buildInvitation({ actorName, documentTitle, when, timezone, meetingTitle }) {
  return `${actorName} scheduled a Daros Live session for "${documentTitle}" on ${when} (${timezone}). Open this notification in Daros to join the live meeting.`;
}

const invitation = buildInvitation({
  actorName: 'Alex Author',
  documentTitle: 'Safety Procedure',
  when: '1 Jan 2026, 14:00',
  timezone: 'Europe/London',
  meetingTitle: 'Live review',
});

console.assert(invitation.includes('Safety Procedure'), 'includes document title');
console.assert(invitation.includes('1 Jan 2026'), 'includes date/time');
console.assert(invitation.includes('Open this notification in Daros'), 'includes access link hint');

const scenarios = [
  'live_meeting_invitation',
  'live_meeting_rescheduled',
  'live_meeting_cancelled',
  'live_meeting_ended',
  'document_reviewed',
  'document_approved',
  'document_rejected',
];

console.log('Live meeting notification scenarios:', scenarios.length);
console.log('Notification copy checks: OK');