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
import { DocumentDetailSkeleton } from '../../../components/common/skeletons/DashboardSkeletons';
import { getCachedData } from '../../../lib/data/clientDataCache';
import { runCachedScreenLoad } from '../../../lib/ui/skeletonLoading';
import {
  canUserApproveDocuments,
  canUserArchiveDocument,
  canUserDeleteDocument,
  canUserEditDocument,
  canUserStartApprovedDocumentRevision,
  isDocumentOwnerSameAsUser,
} from '../../../lib/documentUsers';
import { useAuth } from '../../../context/AuthContext';
import { DocumentPreview } from './DocumentPreview';
import { DocumentTypeMenu } from './DocumentTypeMenu';
import { ProcessMenu } from './ProcessMenu';
import { ConfirmDialog } from '../../../components/dialogs/ConfirmDialog';
import { DocumentWorkflowPeopleDialog } from '../../../components/dialogs/DocumentWorkflowPeopleDialog';
import { hasOpenDocumentRevision } from '../../../lib/documents/documentPublishedBaseline';
import { RejectDocumentDialog } from '../../../components/dialogs/RejectDocumentDialog';
import {
  recalculateDocumentCodeForTypeProcessChange,
} from '../../../lib/documentCode';
import { getDocumentDisplayCode } from '../../../lib/search/documentSearch';
import {
  formatRevisionVersionLabel,
  getNextDocumentVersion,
} from '../../../lib/documents/documentVersionRevision';
import { DarosActionLoadingOverlay } from '../../../components/common/DarosActionLoadingOverlay';
import '../../../components/common/FlashAlert.css';
import { useFlashMessages } from '../../../hooks/useFlashMessages';
import { invalidateCachedData } from '../../../lib/data/clientDataCache';
import { runWithMinDuration } from '../../../lib/ui/runWithMinDuration';
import { DocumentWorkflowStepper } from './DocumentWorkflowStepper';
import { DocumentFieldSelectWithAdd } from './DocumentFieldSelectWithAdd';
import { DocumentFieldMultiSelectWithAdd } from './DocumentFieldMultiSelectWithAdd';
import './DocumentDetailView.css';

const STATUSES: DocumentRecord['status'][] = ['Active', 'Draft', 'Obsolete'];

interface DocumentDetailViewProps {
  documentId: string;
  initialEdit?: boolean;
  autoBeginRevision?: boolean;
  onBack: () => void;
  onDeleted?: () => void;
  onArchived?: () => void;
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
    location: doc.location ?? '',
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
  autoBeginRevision = false,
  onBack,
  onDeleted,
  onArchived,
  onApproved,
  onSubmittedForApproval,
}: DocumentDetailViewProps) {
  const { user } = useAuth();
  const teamUsers = useTeamUsers();
  const canApprove = canUserApproveDocuments(user);
  const documentCacheKey = `document:${documentId}`;
  const cachedDocument = getCachedData<DocumentRecord>(documentCacheKey);
  const [document, setDocument] = useState<DocumentRecord | null>(cachedDocument);
  const [form, setForm] = useState(
    cachedDocument ? documentToForm(cachedDocument) : documentToForm({} as DocumentRecord),
  );
  const [showSkeleton, setShowSkeleton] = useState(!cachedDocument);
  const [isLoading, setIsLoading] = useState(!cachedDocument);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const { error, success, successFadingOut, setError, showSuccess, showError } = useFlashMessages();
  const [showOwnerConfirmDialog, setShowOwnerConfirmDialog] = useState(false);
  const [showResubmitConfirmDialog, setShowResubmitConfirmDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [revisionReviewerDialogOpen, setRevisionReviewerDialogOpen] = useState(false);
  const [revisionApproverDialogOpen, setRevisionApproverDialogOpen] = useState(false);
  const [revisionWorkflowReviewer, setRevisionWorkflowReviewer] = useState('');
  const [revisionWorkflowApprover, setRevisionWorkflowApprover] = useState('');
  const autoBeginRevisionAttempted = useRef(false);
  const [revisionFileError, setRevisionFileError] = useState('');
  const [isUploadingRevisionFile, setIsUploadingRevisionFile] = useState(false);
  const actionBusy = isSaving || isDeleting || isArchiving || isUploadingRevisionFile;
  const ownerFieldRef = useRef<HTMLDivElement>(null);
  const [registerCodes, setRegisterCodes] = useState<string[]>([]);
  const ownerNames = teamUsers.map((entry) => entry.name);

  const loadDocument = useCallback(async () => {
    setError('');
    setIsLoading(true);
    try {
      await runCachedScreenLoad({
        cacheKey: documentCacheKey,
        fetcher: async () => (await api.getDocument(documentId)).document,
        onData: (data) => {
          setDocument(data);
          setForm(documentToForm(data));
          const mayEdit = user ? canUserEditDocument(user, data) : false;
          setIsEditing(initialEdit && mayEdit);
        },
        setShowSkeleton,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load document');
      setShowSkeleton(false);
    } finally {
      setIsLoading(false);
    }
  }, [documentCacheKey, documentId, initialEdit, user, setError]);

  useEffect(() => {
    loadDocument();
  }, [loadDocument]);

  useEffect(() => {
    autoBeginRevisionAttempted.current = false;
  }, [documentId]);

  useEffect(() => {
    if (!autoBeginRevision || autoBeginRevisionAttempted.current || !document || isLoading) return;
    if (document.status !== 'Active' || !user || !canUserStartApprovedDocumentRevision(user, document)) return;

    autoBeginRevisionAttempted.current = true;
    void handleStartVersionUpdate();
  }, [autoBeginRevision, document, isLoading, user]);

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

  async function handleStartVersionUpdate() {
    if (!document || document.status !== 'Active' || isExternal) return;
    if (hasOpenDocumentRevision(document)) {
      showError('A new version revision is already in progress.');
      return;
    }
    if (!user || !canUserStartApprovedDocumentRevision(user, document)) {
      showError('You are not allowed to start a new version for this document.');
      return;
    }

    setError('');
    setIsSaving(true);
    try {
      await runWithMinDuration(async () => {
        const { document: updated } = await api.updateDocument(documentId, {
          beginRevision: true,
          status: 'Draft',
        });
        setDocument(updated);
        setForm(documentToForm(updated));
        setIsEditing(true);
      });
      invalidateCachedData('register:list');
      invalidateCachedData('archives:list');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to start document revision');
    } finally {
      setIsSaving(false);
    }
  }

  async function saveFormChanges(options?: {
    status?: DocumentRecord['status'];
    stayInEdit?: boolean;
    ownerOverride?: string;
    approverOverride?: string;
  }): Promise<DocumentRecord | null> {
    if (!document) return null;

    const nextStatus = options?.status ?? form.status;
    const isExternal = form.documentOrigin === 'External';
    const isApproving =
      !isExternal && document.status === 'Draft' && nextStatus === 'Active';
    const mayApproveOnly =
      isApproving &&
      isPendingDocumentApproval(document) &&
      canApprove &&
      isUserDesignatedApprover(user, document, teamUsers);

    if (!canUserEditDocument(user, document) && !mayApproveOnly) {
      setError('You are not allowed to edit this document.');
      return null;
    }
    if (isExternal && !form.externalVersion.trim()) {
      setError('Version / Edition is required for external documents.');
      return null;
    }

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
      owner: options?.ownerOverride ?? (form.owner || undefined),
      approver:
        options?.approverOverride ??
        (form.approver.trim() || form.owner.trim() || undefined),
      approvedBy: isApproving ? user?.name : form.approvedBy || undefined,
      department: form.department || undefined,
      effectiveDate: form.effectiveDate || undefined,
      reviewFrequency: form.reviewFrequency || undefined,
      nextReviewDate: form.nextReviewDate || undefined,
      repository: form.repository || undefined,
      location: form.location || undefined,
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
          ? Math.max(
              Number(document.revisionTargetVersion ?? form.version ?? document.version) || 0,
              1,
            )
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
    setIsSaving(true);
    try {
      const updated = await runWithMinDuration(() => saveFormChanges({ status: overrides?.status }));
      if (!updated) return;
      const isApproving = overrides?.status === 'Active';
      showSuccess(
        isApproving ? 'Document approved successfully.' : 'Document updated successfully.',
      );
      if (isApproving) {
        invalidateCachedData('register:list');
        invalidateCachedData('archives:list');
        onApproved?.();
      }
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to update document');
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
    try {
      const updated = await runWithMinDuration(() =>
        replaceDocumentSourceFile(documentId, file, {
          clearRejectionMetadata: false,
        }),
      );
      setDocument(updated);
      setForm(documentToForm(updated));
      showSuccess('New file attached. Submit for review when you are ready.');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to upload document file');
    } finally {
      setIsUploadingRevisionFile(false);
    }
  }

  async function completeResubmitForReview() {
    if (!document) return;

    setIsSaving(true);

    try {
      await runWithMinDuration(async () => {
        const saved = await saveFormChanges({ stayInEdit: false });
        if (!saved) {
          throw new Error('Could not save changes before resubmitting.');
        }
        if (!saved.fileName) {
          throw new Error('Upload a document file before resubmitting for review.');
        }

        const { document: updated } = await api.submitDocumentForApproval(documentId);
        setDocument(updated);
        setForm(documentToForm(updated));
        setIsEditing(false);
        onSubmittedForApproval?.();
      });
      showSuccess('Document resubmitted for review.');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to resubmit document');
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

    setIsSaving(true);

    try {
      let message = 'Review complete.';
      await runWithMinDuration(async () => {
        const { document: updated } = await api.reviewDocument(documentId);
        setDocument(updated);
        setForm(documentToForm(updated));
        const approverLabel = getDesignatedApprover(updated);
        const isFinalApprover = isUserDesignatedApprover(user, updated, teamUsers);
        message = isFinalApprover
          ? 'Review complete. You can approve the document when ready.'
          : `Review complete. Sent to ${approverLabel || 'the approver'} for final approval.`;
      });
      showSuccess(message);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to review document');
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

    setIsSaving(true);

    try {
      await runWithMinDuration(async () => {
        const { document: updated } = await api.rejectDocumentForApproval(documentId, reason);
        setDocument(updated);
        setForm(documentToForm(updated));
        setShowRejectDialog(false);
      });
      showSuccess('Document was not approved. The requester has been notified.');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to reject document');
    } finally {
      setIsSaving(false);
    }
  }

  async function submitForReview() {
    if (!document || document.status !== 'Draft' || document.submittedAt) return;

    setIsSaving(true);

    try {
      await runWithMinDuration(async () => {
        const { document: updated } = await api.submitDocumentForApproval(documentId);
        setDocument(updated);
        setForm(documentToForm(updated));
        setIsEditing(false);
        onSubmittedForApproval?.();
      });
      showSuccess('Document submitted for review.');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to submit document for review');
    } finally {
      setIsSaving(false);
    }
  }

  async function completeRevisionWorkflowSubmit() {
    if (!document || !revisionWorkflowReviewer.trim()) return;

    setIsSaving(true);
    try {
      const approver = revisionWorkflowApprover.trim() || revisionWorkflowReviewer.trim();
      await runWithMinDuration(async () => {
        const saved = await saveFormChanges({
          stayInEdit: true,
          ownerOverride: revisionWorkflowReviewer.trim(),
          approverOverride: approver,
        });
        if (!saved) {
          throw new Error('Could not save reviewer and approver.');
        }
        if (!saved.fileName) {
          throw new Error('Upload a document file before submitting for review.');
        }
        if (
          hasOpenDocumentRevision(saved) &&
          !saved.revisionFileUpdated &&
          saved.fileName === saved.publishedBaseline?.fileName
        ) {
          throw new Error('Upload a new document file before submitting this revision for review.');
        }
        await api.submitDocumentForApproval(documentId);
        const { document: updated } = await api.getDocument(documentId);
        setDocument(updated);
        setForm(documentToForm(updated));
        setIsEditing(false);
        onSubmittedForApproval?.();
      });
      setRevisionApproverDialogOpen(false);
      setRevisionReviewerDialogOpen(false);
      showSuccess('New version submitted for review.');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to submit for review');
    } finally {
      setIsSaving(false);
    }
  }

  function handleSubmitForReview() {
    if (!document || document.status !== 'Draft' || document.submittedAt) return;

    if (hasOpenDocumentRevision(document)) {
      setRevisionWorkflowReviewer(form.owner.trim());
      setRevisionWorkflowApprover(form.approver.trim() || form.owner.trim());
      setRevisionReviewerDialogOpen(true);
      return;
    }

    if (isDocumentOwnerSameAsUser(user, document.owner)) {
      setShowOwnerConfirmDialog(true);
      return;
    }

    void submitForReview();
  }

  function handleRevisionReviewerConfirm() {
    if (!revisionWorkflowReviewer.trim()) return;
    setRevisionApproverDialogOpen(true);
  }

  function handleRevisionApproverConfirm() {
    void completeRevisionWorkflowSubmit();
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
    try {
      await runWithMinDuration(() => api.deleteDocument(documentId));
      onDeleted?.();
      onBack();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to delete document');
      setIsDeleting(false);
    }
  }

  async function handleArchive() {
    if (!document) return;
    const label = getDocumentDisplayCode(document) || document.title;
    if (
      !window.confirm(
        `Archive document "${label}"? It will be removed from Document Control and kept in Document Archives.`,
      )
    ) {
      return;
    }

    setIsArchiving(true);
    try {
      await runWithMinDuration(async () => {
        await api.archiveDocument(documentId);
        invalidateCachedData('register:list');
        invalidateCachedData('archives:list');
      });
      showSuccess('Document archived.');
      onArchived?.();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to archive document');
      setIsArchiving(false);
    }
  }

  if (showSkeleton) {
    return (
      <div className="dd-page">
        <DocumentDetailSkeleton />
      </div>
    );
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
  const openRevision = hasOpenDocumentRevision(document);
  const isRevisionStarter =
    (user?.email?.trim().toLowerCase() ?? '') === (document.revisionStartedBy?.trim().toLowerCase() ?? '');
  const revisionHasNewFile =
    document.revisionFileUpdated === true ||
    Boolean(
      document.fileName?.trim() &&
        document.publishedBaseline?.fileName?.trim() &&
        document.fileName.trim() !== document.publishedBaseline.fileName.trim(),
    );
  const canSubmitOpenRevision =
    openRevision && isDraftInternal && !document.submittedAt && !isRejected && isRevisionStarter;
  const canSubmitNewDocument =
    !openRevision && isDraftInternal && !document.submittedAt && isCreator && !isRejected;
  const canSubmitForReview = canSubmitNewDocument || canSubmitOpenRevision;
  const canDelete = canUserDeleteDocument(user, document);
  const showDeleteButton = canDelete && !pendingReview && !pendingFinalApproval;
  const canArchive = canUserArchiveDocument(user, document);
  const showArchiveButton = canArchive && !pendingReview && !pendingFinalApproval;
  const canEditDocument = canUserEditDocument(user, document);
  const canReplaceDocumentFile = canEditDocument && isDraftInternal && !isExternal;
  const lockInternalVersion =
    usesDarosCode &&
    (openRevision || (Boolean(document.submittedAt) && !isRejected));
  const canStartVersionUpdate =
    canUserStartApprovedDocumentRevision(user, document) && !openRevision;
  const pendingRevisionVersion =
    document.revisionTargetVersion ??
    (openRevision && !isExternal ? getNextDocumentVersion(document.version) : null);
  const nextRevisionVersion = !isExternal ? pendingRevisionVersion : null;
  const showBackToControl =
    !isEditing && (Boolean(document.submittedAt) || pendingReview || pendingFinalApproval);
  const displayCode = getDocumentDisplayCode(document) || document.code || '—';
  const displayVersion = isExternal
    ? document.externalVersion || '—'
    : Number.isInteger(document.version)
      ? String(document.version).padStart(2, '0')
      : formatRevisionVersionLabel(document.version);

  const showWorkflowStepper =
    !isEditing &&
    (isCreator || (openRevision && isRevisionStarter)) &&
    (pendingReview || pendingFinalApproval);

  return (
    <div className="dd-page">
      <DarosActionLoadingOverlay active={actionBusy} />
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
              {showBackToControl ? (
                <button type="button" className="dd-btn dd-btn-outline" onClick={onBack}>
                  Back to Document Control
                </button>
              ) : null}
              {canSubmitForReview ? (
                <button
                  type="button"
                  className="dd-btn dd-btn-primary"
                  onClick={handleSubmitForReview}
                  disabled={isSaving || (canSubmitOpenRevision && !revisionHasNewFile)}
                  title={
                    canSubmitOpenRevision && !revisionHasNewFile
                      ? 'Upload a new document file before submitting for review'
                      : undefined
                  }
                >
                  {isSaving ? 'Submitting...' : 'Submit for Review'}
                </button>
              ) : null}
              {canStartVersionUpdate ? (
                <button
                  type="button"
                  className="dd-btn dd-btn-outline"
                  onClick={() => void handleStartVersionUpdate()}
                  disabled={isSaving}
                >
                  {isSaving ? 'Starting...' : 'Start new version update'}
                </button>
              ) : null}
              {canEditDocument ? (
                <button type="button" className="dd-btn dd-btn-outline" onClick={() => setIsEditing(true)}>
                  {canReviseRejected ? 'Revise & resubmit' : 'Edit Document'}
                </button>
              ) : null}
              {showArchiveButton ? (
                <button
                  type="button"
                  className="dd-btn dd-btn-outline"
                  onClick={() => void handleArchive()}
                  disabled={isArchiving}
                >
                  {isArchiving ? 'Archiving...' : 'Archive'}
                </button>
              ) : null}
              {showDeleteButton ? (
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
        <div
          className={`dd-alert ${error ? 'dd-alert-error' : 'dd-alert-success flash-alert-success'}${
            success && successFadingOut ? ' flash-alert-fade-out' : ''
          }`}
          role={error ? 'alert' : 'status'}
          aria-live="polite"
        >
          {error || success}
        </div>
      )}

      {showWorkflowStepper ? <DocumentWorkflowStepper document={document} /> : null}

      {openRevision && !document.submittedAt && isRevisionStarter ? (
        <div className="dd-revision-warning" role="status">
          <strong>New version in progress</strong>
          <p>
            Edit the document and upload an updated PDF, then submit for review. The version will change to{' '}
            <strong>
              {nextRevisionVersion !== null
                ? formatRevisionVersionLabel(nextRevisionVersion)
                : 'the next revision'}
            </strong>{' '}
            only after you submit—not before.
          </p>
          {!revisionHasNewFile ? (
            <p className="dd-revision-warning-note">Upload a new file to unlock Submit for Review.</p>
          ) : null}
        </div>
      ) : null}

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
                <InfoRow label="Repository" value={document.repository} />
                <InfoRow label="Location" value={document.location} />
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
                          readOnly={lockInternalVersion}
                          onChange={(e) => updateField('version', e.target.value)}
                        />
                      </EditField>
                    </>
                  )}
                  <EditField label="Attached File" wide>
                    {canReplaceDocumentFile ? (
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
                    <DocumentFieldSelectWithAdd
                      category="distribution_department"
                      value={form.department}
                      onChange={(v) => updateField('department', v)}
                      placeholder="Select department..."
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
                  <EditField label="Repository">
                    <DocumentFieldSelectWithAdd
                      category="repository"
                      value={form.repository}
                      onChange={(v) => updateField('repository', v)}
                      placeholder="Select repository..."
                    />
                  </EditField>
                  <EditField label="Location">
                    <DocumentFieldSelectWithAdd
                      category="location"
                      value={form.location}
                      onChange={(v) => updateField('location', v)}
                      placeholder="Select location..."
                    />
                  </EditField>
                  <EditField label="Distribution / Access" wide>
                    <DocumentFieldMultiSelectWithAdd
                      category="distribution_department"
                      value={form.distribution}
                      onChange={(v) => updateField('distribution', v)}
                    />
                  </EditField>
                  <EditField label="Retention Period">
                    <DocumentFieldSelectWithAdd
                      category="retention_period"
                      value={form.retentionPeriod}
                      onChange={(v) => updateField('retentionPeriod', v)}
                      placeholder="Select period..."
                    />
                  </EditField>
                  <EditField label="Disposition">
                    <DocumentFieldSelectWithAdd
                      category="disposition"
                      value={form.disposition}
                      onChange={(v) => updateField('disposition', v)}
                      placeholder="Select disposition..."
                    />
                  </EditField>
                  <EditField label="Retention Notes" wide>
                    <textarea
                      className="dd-input dd-textarea"
                      rows={3}
                      value={form.retentionNotes}
                      onChange={(e) => updateField('retentionNotes', e.target.value)}
                      placeholder="Justifications, special retention conditions..."
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

      <DocumentWorkflowPeopleDialog
        open={revisionReviewerDialogOpen && !revisionApproverDialogOpen}
        title="Who will review this version?"
        message="Choose the person responsible for reviewing the new document version before approval."
        fieldLabel="Reviewer"
        value={revisionWorkflowReviewer}
        options={ownerNames}
        placeholder="Select reviewer..."
        confirmLabel="Continue"
        onValueChange={setRevisionWorkflowReviewer}
        onConfirm={handleRevisionReviewerConfirm}
        onCancel={() => setRevisionReviewerDialogOpen(false)}
        confirmDisabled={!revisionWorkflowReviewer.trim()}
      />

      <DocumentWorkflowPeopleDialog
        open={revisionApproverDialogOpen}
        title="Who will approve this version?"
        message="Choose the person who will give final approval after review."
        fieldLabel="Approver"
        value={revisionWorkflowApprover}
        options={ownerNames}
        placeholder="Select approver..."
        confirmLabel="Submit for review"
        onValueChange={setRevisionWorkflowApprover}
        onConfirm={handleRevisionApproverConfirm}
        onCancel={() => {
          setRevisionApproverDialogOpen(false);
          setRevisionReviewerDialogOpen(true);
        }}
        confirmDisabled={!revisionWorkflowApprover.trim() && !revisionWorkflowReviewer.trim()}
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
