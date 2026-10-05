import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { api, type DocumentRecord, type UpdateDocumentPayload } from '../../../lib/api';
import type { DocumentType } from '../../../data/documentTypes';
import { documentTypeBadgeClass } from '../../../data/documentRegister';
import { htmlToPdfFile, isEditorContentEmpty } from '../../../lib/documentContent';
import { isInternalDraftDocument } from '../../../lib/documentStatus';
import { useTeamUsers } from '../../../context/TeamUsersContext';
import { canUserApproveDocuments, canUserDeleteDocument, isDocumentOwnerSameAsUser } from '../../../lib/documentUsers';
import { useAuth } from '../../../context/AuthContext';
import { DocumentPreview } from './DocumentPreview';
import { DocumentEditor } from './DocumentEditor';
import { DocumentTypeMenu } from './DocumentTypeMenu';
import { ProcessMenu } from './ProcessMenu';
import { ConfirmDialog } from '../../../components/dialogs/ConfirmDialog';
import { RejectDocumentDialog } from '../../../components/dialogs/RejectDocumentDialog';
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
    sourceContent: doc.sourceContent ?? '<p></p>',
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
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const ownerFieldRef = useRef<HTMLDivElement>(null);

  const loadDocument = useCallback(async () => {
    setError('');
    setIsLoading(true);
    try {
      const { document: data } = await api.getDocument(documentId);
      setDocument(data);
      setForm(documentToForm(data));
      setIsEditing(initialEdit);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load document');
    } finally {
      setIsLoading(false);
    }
  }, [documentId, initialEdit]);

  useEffect(() => {
    loadDocument();
  }, [loadDocument]);

  function updateField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleCancelEdit() {
    if (document) setForm(documentToForm(document));
    setIsEditing(false);
    setError('');
  }

  async function handleSave(overrides?: { status?: DocumentRecord['status'] }) {
    if (!document) return;
    setError('');
    setSuccess('');
    setIsSaving(true);

    const nextStatus = overrides?.status ?? form.status;
    const isExternal = form.documentOrigin === 'External';
    if (isExternal && !form.externalVersion.trim()) {
      setError('Version / Edition is required for external documents.');
      setIsSaving(false);
      return;
    }

    const isApproving =
      !isExternal &&
      document.status === 'Draft' &&
      nextStatus === 'Active';

    if (isApproving && !canApprove) {
      setError('You are not authorized to approve documents.');
      setIsSaving(false);
      return;
    }

    try {
      if (isApproving) {
        const sourceHtml = form.sourceContent ?? document.sourceContent;
        if (!sourceHtml || isEditorContentEmpty(sourceHtml)) {
          setError('Cannot approve: document has no Word content to convert to PDF.');
          setIsSaving(false);
          return;
        }

        const pdfFile = await htmlToPdfFile(
          sourceHtml,
          `${form.title.trim() || document.title}.pdf`,
        );
        await api.uploadDocumentFile(documentId, pdfFile);
      }

      const payload: UpdateDocumentPayload = {
        type: form.type,
        process: form.process,
        title: form.title,
        status: nextStatus,
        documentOrigin: form.documentOrigin,
        owner: form.owner || undefined,
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
        ...(isApproving
          ? {
              fileFormat: 'pdf' as const,
              fileName: `${form.title.trim() || document.title}.pdf`,
              sourceModified: false,
            }
          : isInternalDraftDocument({ documentOrigin: form.documentOrigin, status: nextStatus }) && !isExternal
            ? {
                sourceContent: form.sourceContent,
                fileFormat: 'word' as const,
                fileName: `${form.title.trim() || document.title}.docx`,
                sourceModified: true,
              }
            : {}),
      };

      const { document: updated } = await api.updateDocument(documentId, payload);
      setDocument(updated);
      setForm(documentToForm(updated));
      setIsEditing(false);
      setSuccess(
        isApproving
          ? 'Document approved and published as PDF.'
          : 'Document updated successfully.',
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

  async function handleApprove() {
    if (!document || document.status !== 'Draft' || !canApprove) return;
    await handleSave({ status: 'Active' });
  }

  async function handleReject(reason: string) {
    if (!document || document.status !== 'Draft' || !document.submittedAt || !canApprove) return;

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

  async function submitForApproval() {
    if (!document || document.status !== 'Draft' || document.submittedAt) return;

    setError('');
    setSuccess('');
    setIsSaving(true);

    try {
      const { document: updated } = await api.submitDocumentForApproval(documentId);
      setDocument(updated);
      setForm(documentToForm(updated));
      setSuccess('Document submitted for approval.');
      onSubmittedForApproval?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit document for approval');
    } finally {
      setIsSaving(false);
    }
  }

  function handleSubmitForApproval() {
    if (!document || document.status !== 'Draft' || document.submittedAt) return;

    if (isDocumentOwnerSameAsUser(user, document.owner)) {
      setShowOwnerConfirmDialog(true);
      return;
    }

    void submitForApproval();
  }

  function handleConfirmSubmitForApproval() {
    setShowOwnerConfirmDialog(false);
    void submitForApproval();
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
  const isPendingApproval = Boolean(document.submittedAt) && document.status === 'Draft';
  const isAssignedOwner = isDocumentOwnerSameAsUser(user, document.owner);
  const canReviewPending = isPendingApproval && canApprove && isAssignedOwner;
  const isCreator =
    (user?.email?.toLowerCase() ?? '') === (document.createdBy?.toLowerCase() ?? '');
  const canSubmitForApproval = isDraftInternal && !document.submittedAt && isCreator;
  const canDelete = canUserDeleteDocument(user, document);
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
            <nav className="dd-breadcrumbs">
              <button type="button" onClick={onBack}>Document Register</button>
              <span>/</span>
              <span className="dd-breadcrumbs-current">{document.title}</span>
            </nav>
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
              {canSubmitForApproval ? (
                <button
                  type="button"
                  className="dd-btn dd-btn-primary"
                  onClick={handleSubmitForApproval}
                  disabled={isSaving}
                >
                  {isSaving ? 'Submitting...' : 'Submit for Approval'}
                </button>
              ) : null}
              <button type="button" className="dd-btn dd-btn-outline" onClick={() => setIsEditing(true)}>
                Edit Document
              </button>
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
              <button type="button" className="dd-btn dd-btn-primary" onClick={() => handleSave()} disabled={isSaving}>
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
        </div>
      ) : null}

      <div className="dd-layout">
        <DocumentPreview
          documentId={documentId}
          title={document.title}
          fileName={document.fileName}
          fileFormat={document.fileFormat}
          sourceContent={document.sourceContent}
          sourceModified={document.sourceModified}
          status={document.status}
          type={document.type}
          process={document.process}
          origin={document.documentOrigin}
          editableDraft={isDraftInternal}
          onSourceContentChange={(html) => {
            setForm((prev) => ({ ...prev, sourceContent: html }));
            setDocument((prev) => (prev ? { ...prev, sourceContent: html } : prev));
          }}
          onSaveDraftContent={async (html) => {
            const { document: updated } = await api.updateDocument(documentId, {
              sourceContent: html,
              fileFormat: 'word',
              fileName: `${document.title}.docx`,
              sourceModified: true,
            });
            setDocument(updated);
            setForm(documentToForm(updated));
          }}
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
                <InfoRow
                  label={isDraftInternal ? 'Document File' : 'PDF File'}
                  value={
                    isDraftInternal
                      ? document.fileName || 'Word document (draft)'
                      : document.fileName || 'Published PDF'
                  }
                />
              </section>

              <section className="dd-card">
                <h3 className="dd-card-title">Control & Approval</h3>
                <InfoRow label="Document Owner" value={document.owner} />
                <InfoRow
                  label="Workflow Status"
                  value={
                    isPendingApproval ? (
                      <span className="doc-badge badge-draft">Pending Approval</span>
                    ) : document.status
                  }
                />
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
            <section className="dd-card dd-edit-card">
              <h3 className="dd-card-title">Edit Document</h3>
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
                <EditField label="Status">
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
                      <input className="dd-input" value={document.code || '—'} readOnly />
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
                <div ref={ownerFieldRef}>
                  <EditField label="Document Owner">
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
              {isDraftInternal && form.documentOrigin !== 'External' ? (
                <div className="dd-draft-editor">
                  <h4 className="dd-draft-editor-title">Word Content</h4>
                  <p className="dd-draft-editor-note">
                    Edit the document below. Change status to Active to approve and publish as PDF.
                  </p>
                  <DocumentEditor
                    content={form.sourceContent}
                    onChange={(html) => updateField('sourceContent', html)}
                  />
                </div>
              ) : null}
            </section>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={showOwnerConfirmDialog}
        title="Confirm submission"
        message="You are both the document creator and the document owner. Are you sure this document can be approved?"
        confirmLabel="Yes"
        cancelLabel="Change document owner"
        onConfirm={handleConfirmSubmitForApproval}
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
