import { useState } from 'react';
import { ConfirmDialog } from '../../../components/dialogs/ConfirmDialog';

interface DarosLiveMeetingDecisionBarProps {
  variant?: 'header' | 'footer';
  statusLabel: string;
  loading: boolean;
  actionBusy: boolean;
  error: string | null;
  canApproveReview: boolean;
  canRejectReview: boolean;
  canApproveDocument: boolean;
  canRejectDocument: boolean;
  showAuthorDocument: boolean;
  canFinishCycle: boolean;
  onApproveReview: () => Promise<void>;
  onRejectReview: (reason: string) => Promise<void>;
  onApproveDocument: () => Promise<void>;
  onRejectDocument: (reason: string) => Promise<void>;
  onAuthorDocument: () => void;
  onFinishCycle: () => Promise<void>;
}

export function DarosLiveMeetingDecisionBar({
  variant = 'footer',
  statusLabel,
  loading,
  actionBusy,
  error,
  canApproveReview,
  canRejectReview,
  canApproveDocument,
  canRejectDocument,
  showAuthorDocument,
  canFinishCycle,
  onApproveReview,
  onRejectReview,
  onApproveDocument,
  onRejectDocument,
  onAuthorDocument,
  onFinishCycle,
}: DarosLiveMeetingDecisionBarProps) {
  const [rejectReviewOpen, setRejectReviewOpen] = useState(false);
  const [rejectDocumentOpen, setRejectDocumentOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [confirmApproveOpen, setConfirmApproveOpen] = useState(false);
  const [confirmFinishOpen, setConfirmFinishOpen] = useState(false);

  const hasActions =
    canApproveReview ||
    canRejectReview ||
    canApproveDocument ||
    canRejectDocument ||
    showAuthorDocument ||
    canFinishCycle;

  return (
    <section
      className={`dl-decision-bar${variant === 'header' ? ' dl-decision-bar-header' : ''}`}
      aria-label="Live approval decisions"
    >
      <div className="dl-decision-status">
        <span className="dl-decision-status-label">Workflow</span>
        <strong>{loading ? 'Loading…' : statusLabel}</strong>
      </div>

      {hasActions ? (
        <div className="dl-decision-actions">
          {showAuthorDocument ? (
            <button
              type="button"
              className="dl-decision-btn dl-decision-btn-outline"
              onClick={onAuthorDocument}
            >
              Document
            </button>
          ) : null}

          {canApproveReview ? (
            <button
              type="button"
              className="dl-decision-btn dl-decision-btn-primary"
              disabled={actionBusy}
              onClick={() => void onApproveReview()}
            >
              {actionBusy ? 'Saving…' : 'Approve review'}
            </button>
          ) : null}

          {canRejectReview ? (
            <button
              type="button"
              className="dl-decision-btn dl-decision-btn-danger"
              disabled={actionBusy}
              onClick={() => setRejectReviewOpen(true)}
            >
              Reject review
            </button>
          ) : null}

          {canApproveDocument ? (
            <button
              type="button"
              className="dl-decision-btn dl-decision-btn-primary"
              disabled={actionBusy}
              onClick={() => setConfirmApproveOpen(true)}
            >
              Approve document
            </button>
          ) : null}

          {canRejectDocument ? (
            <button
              type="button"
              className="dl-decision-btn dl-decision-btn-danger"
              disabled={actionBusy}
              onClick={() => setRejectDocumentOpen(true)}
            >
              Reject document
            </button>
          ) : null}

          {canFinishCycle ? (
            <button
              type="button"
              className="dl-decision-btn dl-decision-btn-primary"
              disabled={actionBusy}
              onClick={() => setConfirmFinishOpen(true)}
            >
              Finish cycle
            </button>
          ) : null}
        </div>
      ) : null}

      {error ? <p className="dl-decision-error">{error}</p> : null}

      <ConfirmDialog
        open={confirmApproveOpen}
        title="Approve document"
        message="Approve this document and complete the live approval cycle?"
        confirmLabel={actionBusy ? 'Approving…' : 'Approve document'}
        cancelLabel="Cancel"
        onConfirm={() => {
          setConfirmApproveOpen(false);
          void onApproveDocument();
        }}
        onCancel={() => setConfirmApproveOpen(false)}
      />

      <ConfirmDialog
        open={confirmFinishOpen}
        title="Finish cycle"
        message="Close this live session and return the document to the standard workflow as active."
        confirmLabel={actionBusy ? 'Finishing…' : 'Finish cycle'}
        cancelLabel="Cancel"
        onConfirm={() => {
          setConfirmFinishOpen(false);
          void onFinishCycle();
        }}
        onCancel={() => setConfirmFinishOpen(false)}
      />

      {rejectReviewOpen ? (
        <RejectReasonDialog
          title="Reject review"
          hint="A reason is required. The author will be notified."
          actionBusy={actionBusy}
          rejectReason={rejectReason}
          onChangeReason={setRejectReason}
          onCancel={() => {
            setRejectReviewOpen(false);
            setRejectReason('');
          }}
          onConfirm={(reason) => {
            setRejectReviewOpen(false);
            setRejectReason('');
            void onRejectReview(reason);
          }}
          confirmLabel="Confirm reject review"
        />
      ) : null}

      {rejectDocumentOpen ? (
        <RejectReasonDialog
          title="Reject document"
          hint="A reason is required. The author will be notified."
          actionBusy={actionBusy}
          rejectReason={rejectReason}
          onChangeReason={setRejectReason}
          onCancel={() => {
            setRejectDocumentOpen(false);
            setRejectReason('');
          }}
          onConfirm={(reason) => {
            setRejectDocumentOpen(false);
            setRejectReason('');
            void onRejectDocument(reason);
          }}
          confirmLabel="Confirm reject"
        />
      ) : null}
    </section>
  );
}

function RejectReasonDialog({
  title,
  hint,
  actionBusy,
  rejectReason,
  onChangeReason,
  onCancel,
  onConfirm,
  confirmLabel,
}: {
  title: string;
  hint: string;
  actionBusy: boolean;
  rejectReason: string;
  onChangeReason: (value: string) => void;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
  confirmLabel: string;
}) {
  return (
    <div className="dl-reject-overlay" role="dialog" aria-modal="true" aria-label={title}>
      <div className="dl-reject-dialog">
        <h3 className="dl-reject-title">{title}</h3>
        <p className="dl-reject-hint">{hint}</p>
        <label className="dl-reject-reason-field">
          <span>Rejection reason</span>
          <textarea
            className="dl-reject-reason-input"
            rows={3}
            value={rejectReason}
            onChange={(e) => onChangeReason(e.target.value)}
            placeholder="Explain why this cannot proceed"
          />
        </label>
        <div className="dl-reject-actions">
          <button
            type="button"
            className="dl-decision-btn dl-decision-btn-danger"
            disabled={actionBusy || !rejectReason.trim()}
            onClick={() => onConfirm(rejectReason.trim())}
          >
            {actionBusy ? 'Saving…' : confirmLabel}
          </button>
          <button type="button" className="dl-decision-btn" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}