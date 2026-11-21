import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { api, type DocumentRecord, type UpdateDocumentPayload } from '../../../lib/api';
import type { DocumentType } from '../../../data/documentTypes';
import { documentTypeBadgeClass } from '../../../data/documentRegister';
import {
  getDocumentStatusLabel,
  isInternalDraftDocument,
  isRejectedDocument,
} from '../../../lib/documentStatus';
import { DOCUMENT_UPLOAD_ACCEPT } from '../../../lib/documents/documentFileKind';
import { replaceDocumentSourceFile } from '../../../lib/documents/documentSourceFile';
import { validateDocumentFile } from '../../../lib/documents/documentUpload';
import {
  getDesignatedApprover,
  isPendingDocumentApproval,
  isPendingDocumentReview,
  isUserDesignatedApprover,
} from '../../../lib/documents/documentApprovalWorkflow';
import { useTeamUsers } from '../../../context/TeamUsersContext';
import {
  canUserApproveDocuments,
  canUserDeleteDocument,
  canUserEditDocument,
  isDocumentOwnerSameAsUser,
} from '../../../lib/documentUsers';
import { useAuth } from '../../../context/AuthContext';
import { DocumentPreview } from './DocumentPreview';
import { DocumentTypeMenu } from './DocumentTypeMenu';
import { ProcessMenu } from './ProcessMenu';
import { ConfirmDialog } from '../../../components/dialogs/ConfirmDialog';
import { RejectDocumentDialog } from '../../../components/dialogs/RejectDocumentDialog';
import { recalculateDocumentCodeForTypeProcessChange } from '../../../lib/documentCode';
import './DocumentDetailView.css';

const STATUSES: DocumentRecord['status'][] = ['Active', 'Draft', 'Obsolete'];

interface DocumentDetailViewProps {
  documentId: string;
  initialEdit?: boolean;
  onBack: () => void;
  onDeleted?: () => void;
  onApproved?: () => void;
  onSubmittedForApproval?: () => void;
}

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="dd-info-row">
      <span className="dd-info-label">{label}</span>
      <span className="dd-info-value">{value || '—'}</span>
    </div>
  );
}

function EditField({
  label,
  children,
  wide,
}: {
  label: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <label className={`dd-edit-field ${wide ? 'wide' : ''}`}>
      <span className="dd-edit-label">{label}</span>
      {children}
    </label>
  );
}

function resolveTeamMemberLabel(
  value: string | undefined,
  teamUsers: { name: string; email: string }[],
): string {
  const raw = value?.trim();
  if (!raw) return '—';
  const match = teamUsers.find(
    (entry) =>
      entry.email.trim().toLowerCase() === raw.toLowerCase() ||
      entry.name.trim().toLowerCase() === raw.toLowerCase(),
  );
  return match?.name ?? raw;
}

function documentToForm(doc: DocumentRecord) {
  return {
    type: doc.type,
    process: doc.process,
    title: doc.title,
    version: String(doc.version),
    status: doc.status,
    documentOrigin: doc.documentOrigin ?? 'Internal',
    externalRef: doc.externalRef ?? '',
    externalVersion: doc.externalVersion ?? '',
    owner: doc.owner ?? '',
    approver: doc.approver ?? '',
    approvedBy: doc.approvedBy ?? '',
    department: doc.department ?? '',
    effectiveDate: doc.effectiveDate ?? '',
    reviewFrequency: doc.reviewFrequency ?? '',
    nextReviewDate: doc.nextReviewDate ?? '',
    repository: doc.repository ?? '',
    distribution: doc.distribution ?? '',
    retentionPeriod: doc.retentionPeriod ?? '',
    retentionNotes: doc.retentionNotes ?? '',
    disposition: doc.disposition ?? '',
    comments: doc.comments ?? '',
  };
}

export function DocumentDetailView({
  documentId,
  initialEdit = false,
  onBack,
  onDeleted,
  onApproved,
  onSubmittedForApproval,
}: DocumentDetailViewProps) {
  const { user } = useAuth();
  const teamUsers = useTeamUsers();
  const canApprove = canUserApproveDocuments(user);
  const [document, setDocument] = useState<DocumentRecord | null>(null);
  const [form, setForm] = useState(documentToForm({} as DocumentRecord));
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showOwnerConfirmDialog, setShowOwnerConfirmDialog] = useState(false);
  const [showResubmitConfirmDialog, setShowResubmitConfirmDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [revisionFileError, setRevisionFileError] = useState('');
  const [isUploadingRevisionFile, setIsUploadingRevisionFile] = useState(false);
  const ownerFieldRef = useRef<HTMLDivElement>(null);
  const [registerCodes, setRegisterCodes] = useState<string[]>([]);

  const loadDocument = useCallback(async () => {
    setError('');
    setIsLoading(true);
    try {
      const { document: data } = await api.getDocument(documentId);
      setDocument(data);
      setForm(documentToForm(data));
      const mayEdit = user ? canUserEditDocument(user, data) : false;
      setIsEditing(initialEdit && mayEdit);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load document');
    } finally {
      setIsLoading(false);
    }
  }, [documentId, initialEdit, user]);

  useEffect(() => {
    loadDocument();
  }, [loadDocument]);

  useEffect(() => {
    if (!isEditing || !document) {
      setRegisterCodes([]);
      return;
    }

    let active = true;
    void api.getDocuments().then(({ documents }) => {
      if (!active) return;
      setRegisterCodes(
        documents
          .filter((item) => item.id !== documentId && item.documentOrigin !== 'External')
          .map((item) => item.code)
          .filter(Boolean),
      );
    });

    return () => {
      active = false;
    };
  }, [isEditing, document, documentId]);

  const usesDarosCode = Boolean(
    document && document.documentOrigin !== 'External' && !document.hasIso,
  );

  const editDocumentCode = useMemo(() => {
    if (!document || !usesDarosCode) return document?.code || '—';
    if (!form.type.trim() || !form.process.trim()) return document.code || '—';
    if (form.type === document.type && form.process === document.process) {
      return document.code || '—';
    }
    return recalculateDocumentCodeForTypeProcessChange(
      form.type,
      form.process,
      document.code,
      registerCodes,
    );
  }, [document, usesDarosCode, form.type, form.process, registerCodes]);

  function updateField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleCancelEdit() {
    if (document) setForm(documentToForm(document));
    setIsEditing(false);
    setError('');
  }

  async function saveFormChanges(options?: {
    status?: DocumentRecord['status'];
    stayInEdit?: boolean;
  }): Promise<DocumentRecord | null> {
    if (!document) return null;
    if (!canUserEditDocument(user, document)) {
      setError('You are not allowed to edit this document.');
      return null;
    }

    const nextStatus = options?.status ?? form.status;
    const isExternal = form.documentOrigin === 'External';
    if (isExternal && !form.externalVersion.trim()) {
      setError('Version / Edition is required for external documents.');
      return null;
    }

    const isApproving =
      !isExternal && document.status === 'Draft' && nextStatus === 'Active';

    if (isApproving && !canApprove) {
      setError('You are not authorized to approve documents.');
      return null;
    }

    if (isApproving && !document.fileName) {
      setError('Cannot approve: upload a document file first.');
      return null;
    }

    const payload: UpdateDocumentPayload = {
      type: form.type,
      process: form.process,
      title: form.title,
      status: nextStatus,
      documentOrigin: form.documentOrigin,
      owner: form.owner || undefined,
      approver: form.approver.trim() || form.owner.trim() || undefined,
      approvedBy: isApproving ? user?.name : form.approvedBy || undefined,
      department: form.department || undefined,
      effectiveDate: form.effectiveDate || undefined,
      reviewFrequency: form.reviewFrequency || undefined,
      nextReviewDate: form.nextReviewDate || undefined,
      repository: form.repository || undefined,
      distribution: form.distribution || undefined,
      retentionPeriod: form.retentionPeriod || undefined,
      retentionNotes: form.retentionNotes || undefined,
      disposition: form.disposition || undefined,
      comments: form.comments || undefined,
      externalRef: isExternal ? form.externalRef.trim() || undefined : undefined,
      externalVersion: isExternal ? form.externalVersion.trim() : undefined,
      version: isExternal
        ? undefined
        : isApproving
          ? Math.max(Number(form.version) || document.version || 0, 1)
          : Number(form.version) || document.version,
      ...(isApproving ? { fileName: document.fileName } : {}),
    };

    const { document: updated } = await api.updateDocument(documentId, payload);
    setDocument(updated);
    setForm(documentToForm(updated));
    if (!options?.stayInEdit) {
      setIsEditing(false);
    }
    return updated;
  }

  async function handleSave(overrides?: { status?: DocumentRecord['status'] }) {
    setError('');
    setSuccess('');
    setIsSaving(true);
    try {
      const updated = await saveFormChanges({ status: overrides?.status });
      if (!updated) return;
      const isApproving = overrides?.status === 'Active';
      setSuccess(
        isApproving ? 'Document approved successfully.' : 'Document updated successfully.',
      );
      if (isApproving) {
        onApproved?.();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update document');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRevisionFileSelect(file: File | undefined) {
    if (!file || !document) return;
    setRevisionFileError('');
    const validationError = validateDocumentFile(file);
    if (validationError) {
      setRevisionFileError(validationError);
      return;
    }

    setIsUploadingRevisionFile(true);
    setError('');
    setSuccess('');
    try {
      const updated = await replaceDocumentSourceFile(documentId, file, {
        clearRejectionMetadata: false,
      });
      setDocument(updated);
      setForm(documentToForm(updated));
      setSuccess('New file attached. Save your changes, then resubmit for review.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload document file');
    } finally {
      setIsUploadingRevisionFile(false);
    }
  }

  async function completeResubmitForReview() {
    if (!document) return;

    setError('');
    setSuccess('');
    setIsSaving(true);

    try {
      const saved = await saveFormChanges({ stayInEdit: false });
      if (!saved) return;
      if (!saved.fileName) {
        setError('Upload a document file before resubmitting for review.');
        return;
      }

      const { document: updated } = await api.submitDocumentForApproval(documentId);
      setDocument(updated);
      setForm(documentToForm(updated));
      setIsEditing(false);
      setSuccess('Document resubmitted for review.');
      onSubmittedForApproval?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resubmit document');
    } finally {
      setIsSaving(false);
      setShowResubmitConfirmDialog(false);
    }
  }

  function handleResubmitForReviewClick() {
    if (!document || !isRejectedDocument(document) || !isCreator) return;

    if (isDocumentOwnerSameAsUser(user, document.owner)) {
      setShowResubmitConfirmDialog(true);
      return;
    }

    void completeResubmitForReview();
  }

  async function handleApprove() {
    if (!document || document.status !== 'Draft' || !canApprove) return;
    if (!isPendingDocumentApproval(document)) return;
    await handleSave({ status: 'Active' });
  }

  async function handleReview() {
    if (!document || !isPendingDocumentReview(document)) return;
    if (!isDocumentOwnerSameAsUser(user, document.owner)) return;

    setError('');
    setSuccess('');
    setIsSaving(true);

    try {
      const { document: updated } = await api.reviewDocument(documentId);
      setDocument(updated);
      setForm(documentToForm(updated));
      const approverLabel = getDesignatedApprover(updated);
      const isFinalApprover = isUserDesignatedApprover(user, updated, teamUsers);
      setSuccess(
        isFinalApprover
          ? 'Review complete. You can approve the document when ready.'
          : `Review complete. Sent to ${approverLabel || 'the approver'} for final approval.`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to review document');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleReject(reason: string) {
    if (!document || document.status !== 'Draft' || !document.submittedAt || !canApprove) return;

    const pendingReview = isPendingDocumentReview(document);
    const pendingFinal = isPendingDocumentApproval(document);
    if (pendingReview && !isDocumentOwnerSameAsUser(user, document.owner)) return;
    if (pendingFinal && !isUserDesignatedApprover(user, document, teamUsers)) return;
    if (!pendingReview && !pendingFinal) return;

    setError('');
    setSuccess('');
    setIsSaving(true);

    try {
      const { document: updated } = await api.rejectDocumentForApproval(documentId, reason);
      setDocument(updated);
      setForm(documentToForm(updated));
      setShowRejectDialog(false);
      setSuccess('Document was not approved. The requester has been notified.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject document');
    } finally {
      setIsSaving(false);
    }
  }

  async function submitForReview() {
    if (!document || document.status !== 'Draft' || document.submittedAt) return;

    setError('');
    setSuccess('');
    setIsSaving(true);

    try {
      const { document: updated } = await api.submitDocumentForApproval(documentId);
      setDocument(updated);
      setForm(documentToForm(updated));
      setSuccess('Document submitted for review.');
      onSubmittedForApproval?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit document for review');
    } finally {
      setIsSaving(false);
    }
  }

  function handleSubmitForReview() {
    if (!document || document.status !== 'Draft' || document.submittedAt) return;

    if (isDocumentOwnerSameAsUser(user, document.owner)) {
      setShowOwnerConfirmDialog(true);
      return;
    }

    void submitForReview();
  }

  function handleConfirmSubmitForReview() {
    setShowOwnerConfirmDialog(false);
    void submitForReview();
  }

  function handleChangeDocumentOwner() {
    setShowOwnerConfirmDialog(false);
    setIsEditing(true);
    window.setTimeout(() => {
      ownerFieldRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      ownerFieldRef.current?.querySelector('select')?.focus();
    }, 0);
  }

  async function handleDelete() {
    if (!document) return;
    const label =
      document.documentOrigin === 'External'
        ? document.externalRef || document.title
        : document.code || document.title;

    if (!window.confirm(`Delete document "${label}"? This action cannot be undone.`)) return;

    setIsDeleting(true);
    setError('');
    try {
      await api.deleteDocument(documentId);
      onDeleted?.();
      onBack();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete document');
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return <div className="dd-page"><div className="dd-loading">Loading document...</div></div>;
  }

  if (!document) {
    return (
      <div className="dd-page">
        <div className="dd-error-state">
          <p>{error || 'Document not found.'}</p>
          <button type="button" className="dd-btn dd-btn-outline" onClick={onBack}>Back to Register</button>
        </div>
      </div>
    );
  }

  const isExternal = document.documentOrigin === 'External';
  const isDraftInternal = isInternalDraftDocument(document);
  const isAssignedOwner = isDocumentOwnerSameAsUser(user, document.owner);
  const pendingReview = isPendingDocumentReview(document);
  const pendingFinalApproval = isPendingDocumentApproval(document);
  const canReviewPending = pendingReview && canApprove && isAssignedOwner;
  const canFinalApprove =
    pendingFinalApproval && canApprove && isUserDesignatedApprover(user, document, teamUsers);
  const workflowStatusLabel = getDocumentStatusLabel(document);
  const reviewedByLabel = resolveTeamMemberLabel(document.reviewedBy, teamUsers);
  const isCreator =
    (user?.email?.toLowerCase() ?? '') === (document.createdBy?.toLowerCase() ?? '');
  const isRejected = isRejectedDocument(document);
  const canReviseRejected = isRejected && isCreator && isDraftInternal;
  const canSubmitForReview =
    isDraftInternal && !document.submittedAt && isCreator && !isRejected;
  const canDelete = canUserDeleteDocument(user, document);
  const canEditDocument = canUserEditDocument(user, document);
  const displayCode = isExternal ? document.externalRef || '—' : document.code || '—';
  const displayVersion = isExternal
    ? document.externalVersion || '—'
    : String(document.version).padStart(2, '0');

  return (
    <div className="dd-page">
      <div className="dd-topbar">
        <div className="dd-topbar-left">
          <button type="button" className="dd-back-btn" onClick={onBack} aria-label="Back">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>
          <div>
            <h1 className="dd-page-title">{document.title}</h1>
          </div>
        </div>
        <div className="dd-topbar-actions">
          {!isEditing ? (
            <>
              {canReviewPending ? (
                <>
                  <button
                    type="button"
                    className="dd-btn dd-btn-primary"
                    onClick={handleReview}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Reviewing...' : 'Review and Send for Approval'}
                  </button>
                  <button
                    type="button"
                    className="dd-btn dd-btn-danger"
                    onClick={() => setShowRejectDialog(true)}
                    disabled={isSaving}
                  >
                    Do Not Approve
                  </button>
                </>
              ) : null}
              {canFinalApprove ? (
                <>
                  <button
                    type="button"
                    className="dd-btn dd-btn-primary"
                    onClick={handleApprove}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Approving...' : 'Approve Document'}
                  </button>
                  <button
                    type="button"
                    className="dd-btn dd-btn-danger"
                    onClick={() => setShowRejectDialog(true)}
                    disabled={isSaving}
                  >
                    Do Not Approve
                  </button>
                </>
              ) : null}
              {canSubmitForReview ? (
                <button
                  type="button"
                  className="dd-btn dd-btn-primary"
                  onClick={handleSubmitForReview}
                  disabled={isSaving}
                >
                  {isSaving ? 'Submitting...' : 'Submit for Review'}
                </button>
              ) : null}
              {canEditDocument ? (
                <button type="button" className="dd-btn dd-btn-outline" onClick={() => setIsEditing(true)}>
                  {canReviseRejected ? 'Revise & resubmit' : 'Edit Document'}
                </button>
              ) : null}
              {canDelete ? (
                <button
                  type="button"
                  className="dd-btn dd-btn-danger"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              ) : null}
            </>
          ) : (
            <>
              <button type="button" className="dd-btn dd-btn-outline" onClick={handleCancelEdit}>
                Cancel
              </button>
              {canReviseRejected ? (
                <button
                  type="button"
                  className="dd-btn dd-btn-primary"
                  onClick={handleResubmitForReviewClick}
                  disabled={isSaving || isUploadingRevisionFile}
                >
                  {isSaving ? 'Resubmitting...' : 'Resubmit for Review'}
                </button>
              ) : null}
              <button
                type="button"
                className="dd-btn dd-btn-primary"
                onClick={() => handleSave()}
                disabled={isSaving || isUploadingRevisionFile}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          )}
        </div>
      </div>

      {(error || success) && (
        <div className={`dd-alert ${error ? 'dd-alert-error' : 'dd-alert-success'}`}>
          {error || success}
        </div>
      )}

      {document.rejectionReason && !document.submittedAt && isCreator ? (
        <div className="dd-rejection-notice">
          <strong>Not approved</strong>
          <p>{document.rejectionReason}</p>
          {document.rejectedBy ? (
            <span className="dd-rejection-meta">
              By {document.rejectedBy}
              {document.rejectedAt ? ` · ${new Date(document.rejectedAt).toLocaleString()}` : ''}
            </span>
          ) : null}
          {!isEditing ? (
            <button
              type="button"
              className="dd-btn dd-btn-primary dd-rejection-action"
              onClick={() => setIsEditing(true)}
            >
              Revise & resubmit
            </button>
          ) : (
            <p className="dd-rejection-edit-hint">
              Update the fields below, replace the file if needed, then use Resubmit for Review.
            </p>
          )}
        </div>
      ) : null}

      <div className="dd-layout">
        <DocumentPreview
          documentId={documentId}
          title={document.title}
          fileName={document.fileName}
          fileFormat={document.fileFormat}
          status={document.status}
          type={document.type}
          process={document.process}
          origin={document.documentOrigin}
        />

        <div className="dd-details">
          {!isEditing ? (
            <>
              <section className="dd-card">
                <h3 className="dd-card-title">General Information</h3>
                <InfoRow label={isExternal ? 'External Reference' : 'Document Code'} value={displayCode} />
                <InfoRow label="Document Title" value={document.title} />
                <InfoRow
                  label="Document Type"
                  value={
                    <span className={`doc-badge ${documentTypeBadgeClass(document.type)}`}>
                      {document.type}
                    </span>
                  }
                />
                <InfoRow label="Process" value={document.process} />
                <InfoRow label="Origin" value={document.documentOrigin ?? 'Internal'} />
                <InfoRow label={isExternal ? 'Version / Edition' : 'Version'} value={displayVersion} />
                <InfoRow label="Attached File" value={document.fileName || '—'} />
              </section>

              <section className="dd-card">
                <h3 className="dd-card-title">Control & Approval</h3>
                <InfoRow label="Document Owner (Reviewer)" value={document.owner} />
                <InfoRow
                  label="Final Approver"
                  value={getDesignatedApprover(document) || document.owner}
                />
                <InfoRow
                  label="Workflow Status"
                  value={
                    workflowStatusLabel !== document.status ? (
                      <span className="doc-badge badge-draft">{workflowStatusLabel}</span>
                    ) : (
                      document.status
                    )
                  }
                />
                <InfoRow label="Reviewed By" value={reviewedByLabel} />
                <InfoRow label="Approved By" value={document.approvedBy} />
                <InfoRow label="Department" value={document.department} />
                <InfoRow label="Effective Date" value={document.effectiveDate} />
                <InfoRow label="Review Frequency" value={document.reviewFrequency} />
                <InfoRow label="Next Review Date" value={document.nextReviewDate} />
              </section>

              <section className="dd-card">
                <h3 className="dd-card-title">Retention & Access</h3>
                <InfoRow label="Repository / Location" value={document.repository} />
                <InfoRow label="Distribution / Access" value={document.distribution} />
                <InfoRow label="Retention Period" value={document.retentionPeriod} />
                <InfoRow label="Retention Notes" value={document.retentionNotes} />
                <InfoRow label="Disposition" value={document.disposition} />
                <InfoRow label="Comments" value={document.comments} />
              </section>

              <section className="dd-card">
                <h3 className="dd-card-title">System Information</h3>
                <InfoRow label="Created By" value={document.createdBy} />
                <InfoRow
                  label="Created At"
                  value={document.createdAt ? new Date(document.createdAt).toLocaleString() : '—'}
                />
              </section>
            </>
          ) : (
            <>
              <section className="dd-card">
                <h3 className="dd-card-title">General Information</h3>
                <div className="dd-edit-grid">
                  <EditField label="Document Title">
                    <input
                      className="dd-input"
                      value={form.title}
                      onChange={(e) => updateField('title', e.target.value)}
                    />
                  </EditField>
                  <EditField label="Document Type">
                    <DocumentTypeMenu
                      value={form.type}
                      onChange={(v) => updateField('type', v as DocumentType)}
                    />
                  </EditField>
                  <EditField label="Process">
                    <ProcessMenu value={form.process} onChange={(v) => updateField('process', v)} />
                  </EditField>
                  <EditField label="Document Origin">
                    <select
                      className="dd-input"
                      value={form.documentOrigin}
                      onChange={(e) => updateField('documentOrigin', e.target.value)}
                    >
                      <option value="Internal">Internal</option>
                      <option value="External">External</option>
                    </select>
                  </EditField>
                  {form.documentOrigin === 'External' ? (
                    <>
                      <EditField label="External Reference">
                        <input
                          className="dd-input"
                          value={form.externalRef}
                          onChange={(e) => updateField('externalRef', e.target.value)}
                        />
                      </EditField>
                      <EditField label="Version / Edition">
                        <input
                          className="dd-input"
                          value={form.externalVersion}
                          onChange={(e) => updateField('externalVersion', e.target.value)}
                        />
                      </EditField>
                    </>
                  ) : (
                    <>
                      <EditField label="Document Code">
                        <input
                          className="dd-input"
                          value={usesDarosCode ? editDocumentCode : document.code || '—'}
                          readOnly
                        />
                        {usesDarosCode && editDocumentCode !== (document.code || '—') ? (
                          <span className="dd-edit-hint">
                            Updates automatically when you change type or process (DAROS structure).
                          </span>
                        ) : null}
                      </EditField>
                      <EditField label="Version">
                        <input
                          className="dd-input"
                          type="number"
                          min="0"
                          value={form.version}
                          onChange={(e) => updateField('version', e.target.value)}
                        />
                      </EditField>
                    </>
                  )}
                  <EditField label="Attached File" wide>
                    {canReviseRejected ? (
                      <div className="dd-revision-file">
                        <p className="dd-revision-file-current">
                          Current: {document.fileName || 'No file attached'}
                        </p>
                        <label className="dd-btn dd-btn-outline dd-revision-file-btn">
                          {isUploadingRevisionFile ? 'Uploading...' : 'Upload new document'}
                          <input
                            type="file"
                            hidden
                            accept={DOCUMENT_UPLOAD_ACCEPT}
                            disabled={isUploadingRevisionFile || isSaving}
                            onChange={(e) => {
                              void handleRevisionFileSelect(e.target.files?.[0]);
                              e.target.value = '';
                            }}
                          />
                        </label>
                        {revisionFileError ? (
                          <p className="dd-revision-file-error">{revisionFileError}</p>
                        ) : null}
                        <p className="dd-revision-file-hint">
                          PDF, Office, images, and more · max 50 MB
                        </p>
                      </div>
                    ) : (
                      <input className="dd-input" value={document.fileName || '—'} readOnly />
                    )}
                  </EditField>
                </div>
              </section>

              <section className="dd-card">
                <h3 className="dd-card-title">Control & Approval</h3>
                <div className="dd-edit-grid">
                  <div ref={ownerFieldRef}>
                    <EditField label="Document Owner (Reviewer)">
                      <select
                        className="dd-input"
                        value={form.owner}
                        onChange={(e) => updateField('owner', e.target.value)}
                      >
                        <option value="">Select document owner...</option>
                        {teamUsers.map((owner) => (
                          <option key={owner.email} value={owner.name}>{owner.name}</option>
                        ))}
                      </select>
                    </EditField>
                  </div>
                  <EditField label="Final Approver">
                    <select
                      className="dd-input"
                      value={form.approver}
                      onChange={(e) => updateField('approver', e.target.value)}
                    >
                      <option value="">Same as reviewer (default)</option>
                      {teamUsers.map((entry) => (
                        <option key={entry.email} value={entry.name}>{entry.name}</option>
                      ))}
                    </select>
                  </EditField>
                  <EditField label="Workflow Status">
                    <select
                      className="dd-input"
                      value={form.status}
                      onChange={(e) => updateField('status', e.target.value as DocumentRecord['status'])}
                    >
                      {STATUSES.map((s) => {
                        const isActiveOption = s === 'Active';
                        const disableActive =
                          isActiveOption &&
                          document.status === 'Draft' &&
                          !canApprove;

                        return (
                          <option key={s} value={s} disabled={disableActive}>
                            {s}
                            {disableActive ? ' (approvers only)' : ''}
                          </option>
                        );
                      })}
                    </select>
                  </EditField>
                  <EditField label="Approved By">
                    <input
                      className="dd-input"
                      value={form.approvedBy}
                      readOnly
                      placeholder="Set automatically on approval"
                    />
                  </EditField>
                  <EditField label="Department">
                    <input
                      className="dd-input"
                      value={form.department}
                      onChange={(e) => updateField('department', e.target.value)}
                    />
                  </EditField>
                  <EditField label="Effective Date">
                    <input
                      className="dd-input"
                      type="date"
                      value={form.effectiveDate}
                      onChange={(e) => updateField('effectiveDate', e.target.value)}
                    />
                  </EditField>
                  <EditField label="Review Frequency">
                    <input
                      className="dd-input"
                      value={form.reviewFrequency}
                      onChange={(e) => updateField('reviewFrequency', e.target.value)}
                    />
                  </EditField>
                  <EditField label="Next Review Date">
                    <input
                      className="dd-input"
                      type="date"
                      value={form.nextReviewDate}
                      onChange={(e) => updateField('nextReviewDate', e.target.value)}
                    />
                  </EditField>
                </div>
              </section>

              <section className="dd-card">
                <h3 className="dd-card-title">Retention & Access</h3>
                <div className="dd-edit-grid">
                  <EditField label="Repository / Location">
                    <input
                      className="dd-input"
                      value={form.repository}
                      onChange={(e) => updateField('repository', e.target.value)}
                    />
                  </EditField>
                  <EditField label="Distribution / Access">
                    <input
                      className="dd-input"
                      value={form.distribution}
                      onChange={(e) => updateField('distribution', e.target.value)}
                    />
                  </EditField>
                  <EditField label="Retention Period">
                    <input
                      className="dd-input"
                      value={form.retentionPeriod}
                      onChange={(e) => updateField('retentionPeriod', e.target.value)}
                    />
                  </EditField>
                  <EditField label="Disposition">
                    <input
                      className="dd-input"
                      value={form.disposition}
                      onChange={(e) => updateField('disposition', e.target.value)}
                    />
                  </EditField>
                  <EditField label="Retention Notes" wide>
                    <input
                      className="dd-input"
                      value={form.retentionNotes}
                      onChange={(e) => updateField('retentionNotes', e.target.value)}
                    />
                  </EditField>
                  <EditField label="Comments" wide>
                    <textarea
                      className="dd-input dd-textarea"
                      rows={3}
                      value={form.comments}
                      onChange={(e) => updateField('comments', e.target.value)}
                    />
                  </EditField>
                </div>
              </section>

              <section className="dd-card">
                <h3 className="dd-card-title">System Information</h3>
                <div className="dd-edit-grid">
                  <EditField label="Created By">
                    <input className="dd-input" value={document.createdBy || '—'} readOnly />
                  </EditField>
                  <EditField label="Created At">
                    <input
                      className="dd-input"
                      value={document.createdAt ? new Date(document.createdAt).toLocaleString() : '—'}
                      readOnly
                    />
                  </EditField>
                </div>
              </section>
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={showResubmitConfirmDialog}
        title="Resubmit for your own review"
        message="You are the reviewer for this document. After you resubmit, open the workflow and use Review and Send for Approval. If you are also the final approver, approve on the next step. Continue?"
        confirmLabel="Yes, resubmit"
        cancelLabel="Cancel"
        onConfirm={() => void completeResubmitForReview()}
        onCancel={() => setShowResubmitConfirmDialog(false)}
      />

      <ConfirmDialog
        open={showOwnerConfirmDialog}
        title="Submit for your own review"
        message="You selected yourself as the reviewer for this document. After you submit, you will need to open it and use Review and Send for Approval. If you are also the final approver, you can approve it on the next step. Continue?"
        confirmLabel="Yes, submit"
        cancelLabel="Choose a different reviewer"
        onConfirm={handleConfirmSubmitForReview}
        onCancel={handleChangeDocumentOwner}
      />

      <RejectDocumentDialog
        open={showRejectDialog}
        documentTitle={document.title}
        onConfirm={handleReject}
        onCancel={() => setShowRejectDialog(false)}
        isSubmitting={isSaving}
      />
    </div>
  );
}
