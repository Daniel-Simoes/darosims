import { useState } from 'react';
import { ConfirmDialog } from '../../../components/dialogs/ConfirmDialog';

interface DarosLiveMeetingDecisionBarProps {
  statusLabel: string;
  loading: boolean;
  actionBusy: boolean;
  error: string | null;
  canMarkReviewed: boolean;
  canApprove: boolean;
  canReject: boolean;
  onMarkReviewed: () => Promise<void>;
  onApprove: () => Promise<void>;
  onReject: (reason: string) => Promise<void>;
}

export function DarosLiveMeetingDecisionBar({
  statusLabel,
  loading,
  actionBusy,
  error,
  canMarkReviewed,
  canApprove,
  canReject,
  onMarkReviewed,
  onApprove,
  onReject,
}: DarosLiveMeetingDecisionBarProps) {
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [confirmApproveOpen, setConfirmApproveOpen] = useState(false);

  return (
    <section className="dl-decision-bar" aria-label="Live approval decisions">
      <div className="dl-decision-status">
        <span className="dl-decision-status-label">Workflow</span>
        <strong>{loading ? 'Loading…' : statusLabel}</strong>
      </div>

      <div className="dl-decision-actions">
        {canMarkReviewed ? (
          <button
            type="button"
            className="dl-decision-btn dl-decision-btn-primary"
            disabled={actionBusy}
            onClick={() => void onMarkReviewed()}
          >
            {actionBusy ? 'Saving…' : 'Mark as Reviewed'}
          </button>
        ) : null}

        {canApprove ? (
          <button
            type="button"
            className="dl-decision-btn dl-decision-btn-primary"
            disabled={actionBusy}
            onClick={() => setConfirmApproveOpen(true)}
          >
            Approve
          </button>
        ) : null}

        {canReject ? (
          <button
            type="button"
            className="dl-decision-btn dl-decision-btn-danger"
            disabled={actionBusy}
            onClick={() => setRejectOpen(true)}
          >
            Reject
          </button>
        ) : null}
      </div>

      {error ? <p className="dl-decision-error">{error}</p> : null}

      <ConfirmDialog
        open={confirmApproveOpen}
        title="Approve document"
        message="Approve this document and complete the live approval cycle? This uses the same final approval step as Standard Approval."
        confirmLabel={actionBusy ? 'Approving…' : 'Approve'}
        cancelLabel="Cancel"
        onConfirm={() => {
          setConfirmApproveOpen(false);
          void onApprove();
        }}
        onCancel={() => setConfirmApproveOpen(false)}
      />

      {rejectOpen ? (
        <div className="dl-reject-overlay" role="dialog" aria-modal="true" aria-label="Reject document">
          <div className="dl-reject-dialog">
            <h3 className="dl-reject-title">Reject document</h3>
            <p className="dl-reject-hint">A reason is required. The author will be notified.</p>
            <label className="dl-reject-reason-field">
              <span>Rejection reason</span>
              <textarea
                className="dl-reject-reason-input"
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Explain why this document cannot be approved"
              />
            </label>
            <div className="dl-reject-actions">
              <button
                type="button"
                className="dl-decision-btn dl-decision-btn-danger"
                disabled={actionBusy || !rejectReason.trim()}
                onClick={() => {
                  const reason = rejectReason.trim();
                  setRejectOpen(false);
                  setRejectReason('');
                  void onReject(reason);
                }}
              >
                {actionBusy ? 'Rejecting…' : 'Confirm reject'}
              </button>
              <button
                type="button"
                className="dl-decision-btn"
                onClick={() => {
                  setRejectOpen(false);
                  setRejectReason('');
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}