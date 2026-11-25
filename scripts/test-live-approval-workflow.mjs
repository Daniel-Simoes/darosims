/**
 * Simulates meeting decision status transitions (author / reviewer / approver order).
 * Run: node scripts/test-live-approval-workflow.mjs
 */

let status = 'pending';

function reviewerActs() {
  if (status !== 'pending') throw new Error('reviewer blocked');
  status = 'reviewed';
}

function approverActs(action) {
  if (status !== 'reviewed') throw new Error('approver blocked before review');
  status = action;
}

reviewerActs();
console.assert(status === 'reviewed', 'review completes');

approverActs('approved');
console.assert(status === 'approved', 'approve after review');

status = 'pending';
reviewerActs();
try {
  approverActs('approved');
} catch {
  // reset path
}
status = 'reviewed';

let secondApproveFailed = false;
try {
  reviewerActs();
} catch {
  secondApproveFailed = true;
}
console.assert(secondApproveFailed, 'cannot review twice');

status = 'pending';
reviewerActs();
approverActs('rejected');
console.assert(status === 'rejected', 'reject path');

console.log('Live approval workflow order: OK', { final: status });