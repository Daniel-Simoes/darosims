/**
 * Simulates author, reviewer, and approver each applying the same broadcast.
 * Run: node scripts/test-document-viewer-sync.mjs
 */

function applyRemote(participant, message) {
  if (message.meetingId !== participant.meetingId) return false;
  if (message.documentId !== participant.documentId) return false;
  if (message.documentVersion !== participant.documentVersion) return false;
  if (message.type === 'request') return false;
  if (message.seq <= participant.lastSeq) return false;
  participant.lastSeq = message.seq;
  participant.page = message.page;
  return true;
}

const base = {
  meetingId: 'meet-1',
  documentId: 'doc-1',
  documentVersion: 0,
};

const author = { ...base, id: 'author', lastSeq: 0, page: 0 };
const reviewer = { ...base, id: 'reviewer', lastSeq: 0, page: 0 };
const approver = { ...base, id: 'approver', lastSeq: 0, page: 0 };

let seq = 0;

function broadcastFromAuthor(page) {
  seq += 1;
  author.page = page;
  author.lastSeq = seq;
  const msg = {
    type: 'page',
    meetingId: base.meetingId,
    documentId: base.documentId,
    documentVersion: base.documentVersion,
    page,
    seq,
    senderId: author.id,
  };
  const r = applyRemote(reviewer, msg);
  const a = applyRemote(approver, msg);
  return { r, a };
}

const first = broadcastFromAuthor(2);
console.assert(first.r && first.a, 'reviewer and approver follow page 2');
console.assert(reviewer.page === 2 && approver.page === 2, 'pages aligned at 2');

const second = broadcastFromAuthor(0);
console.assert(reviewer.page === 0 && approver.page === 0, 'all on page 1 (index 0)');

const stale = {
  type: 'page',
  meetingId: base.meetingId,
  documentId: base.documentId,
  documentVersion: base.documentVersion,
  page: 9,
  seq: 1,
  senderId: 'reviewer',
};
console.assert(!applyRemote(reviewer, stale), 'stale seq rejected');

console.log('Three-participant document viewer sync: OK', {
  author: author.page,
  reviewer: reviewer.page,
  approver: approver.page,
  lastSeq: seq,
});