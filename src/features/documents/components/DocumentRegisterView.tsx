import { type FormEvent, type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { api, fetchDocumentFileBlob, type CreateDocumentPayload, type DocumentRecord } from '../../../lib/api';
import { documentTypeBadgeClass } from '../../../data/documentRegister';
import { DOCUMENT_TYPES, TYPE_PREFIX } from '../../../data/documentTypes';
import { downloadDocumentRegisterCsv } from '../utils/documentRegisterExport';
import { useTeamUsers } from '../../../context/TeamUsersContext';
import { useAuth } from '../../../context/AuthContext';
import { generateDocumentCode } from '../../../lib/documentCode';
import { getDocumentDisplayCode } from '../../../lib/search/documentSearch';
import { invalidateCachedData } from '../../../lib/data/clientDataCache';
import {
  getDocumentStatusLabel,
  isPendingApprovalDocument,
  isRegisterPendingDocument,
  isRejectedDocument,
} from '../../../lib/documentStatus';
import { DocumentTypeMenu } from './DocumentTypeMenu';
import { ProcessMenu } from './ProcessMenu';
import { EmptyDraftsLottie } from './EmptyDraftsLottie';
import { ConfirmDialog } from '../../../components/dialogs/ConfirmDialog';
import { ListSearchBar } from '../../../components/common/ListSearchBar';
import { ListPaginationFooter } from '../../../components/common/ListPaginationFooter';
import { ListPageSizeSelect } from '../../../components/common/ListPageSizeSelect';
import { usePaginatedSlice } from '../../../lib/pagination/usePaginatedSlice';
import { matchesTitleOrCode } from '../../../lib/search/documentSearch';
import { RegisterSelect } from './RegisterSelect';
import { DocumentReviewHistoryDialog } from './DocumentReviewHistoryDialog';
import { DocumentCommentsChat } from './DocumentCommentsChat';
import {
  getDocumentCommentsBlockReason,
  type DocumentCommentsBlockReason,
} from '../../../lib/documents/documentCommentsGate';
import { buildDocumentReviewHistoryRows, buildDocumentReviewTimeline } from '../utils/reviewHistory';
import { getDocumentRegisterOwnerDisplay, isRegisterOwnerMetaPositive } from '../utils/registerOwnerDisplay';
import { DocumentRegisterTableActions } from './DocumentRegisterTableActions';
import { DocumentTypeIcon, getRegisterTypeAvatarClass } from '../utils/registerTypeAvatar';
import type { DocumentEventRecord } from '../../../types/audit';
import type { DocumentArchiveRecord } from '../../../types/documentArchive';

const REGISTER_LIST_CACHE_KEY = 'register:list';

type RegisterListCache = {
  documents: DocumentRecord[];
  archives: DocumentArchiveRecord[];
};
import { DarosActionLoadingOverlay } from '../../../components/common/DarosActionLoadingOverlay';
import '../../../components/common/FlashAlert.css';
import { useFlashMessages } from '../../../hooks/useFlashMessages';
import { runWithMinDuration } from '../../../lib/ui/runWithMinDuration';
import { getCachedData } from '../../../lib/data/clientDataCache';
import { runCachedScreenLoad } from '../../../lib/ui/skeletonLoading';
import { DocumentRegisterStats, type DocumentRegisterStatusFilter } from './DocumentRegisterStats';
import { DocumentTableSkeleton, RegisterStatsSkeleton } from '../../../components/common/skeletons/DashboardSkeletons';
import './DocumentRegisterView.css';
import './DocumentRegisterStats.css';


const ORIGINS = ['Internal', 'External'];
const DEPARTMENTS = ['Quality', 'Production', 'HR', 'Operations', 'Management'];
const FREQUENCIES = ['Annual', 'Bi-annual', 'Quarterly', 'Monthly'];
const LOCATIONS = ['Document Control', 'Quality System', 'Production', 'HR Files'];
const ACCESS_LEVELS = ['All Staff', 'Management', 'Quality Team', 'Restricted'];
const RETENTION_PERIODS = ['1 year', '3 years', '5 years', '7 years', 'Permanent'];
const DISPOSITIONS = ['Archive', 'Destroy', 'Retain'];

const emptyForm = {
  type: 'Form',
  process: '',
  title: '',
  version: '1',
  documentOrigin: 'Internal',
  owner: '',
  approvedBy: '',
  department: '',
  effectiveDate: '',
  reviewFrequency: '',
  nextReviewDate: '',
  repository: '',
  distribution: '',
  retentionPeriod: '',
  retentionNotes: '',
  disposition: '',
  comments: '',
};

function SortIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m7 15 5 5 5-5M7 9l5-5 5 5" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

function getTypeAvatarLetter(doc: DocumentRecord) {
  const prefix = TYPE_PREFIX[doc.type];
  if (prefix?.trim()) return prefix.trim().charAt(0).toUpperCase();
  const type = doc.type?.trim();
  return type ? type.charAt(0).toUpperCase() : '?';
}

function getRegisterStatusLabel(doc: DocumentRecord) {
  const label = getDocumentStatusLabel(doc);
  if (label === 'Pending Review' || label === 'Pending Approval') return 'PENDING';
  if (label === 'Not Approved') return 'REJECTED';
  return label.toUpperCase();
}

function getRegisterStatusClass(doc: DocumentRecord) {
  if (isPendingApprovalDocument(doc)) return 'doc-reg-pill-pending';
  if (isRejectedDocument(doc)) return 'doc-reg-pill-rejected';
  switch (doc.status) {
    case 'Active':
      return 'doc-reg-pill-sent';
    case 'Draft':
      return 'doc-reg-pill-draft';
    case 'Obsolete':
      return 'doc-reg-pill-obsolete';
    default:
      return 'doc-reg-pill-draft';
  }
}

function FormField({
  label,
  required,
  children,
  hint,
  wide,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
  hint?: string;
  wide?: boolean;
}) {
  return (
    <div className={`doc-form-field ${wide ? 'wide' : ''}`}>
      <label className="doc-form-label">
        {label}
        {required && <span className="doc-required">*</span>}
      </label>
      {children}
      {hint && <span className="doc-form-hint">{hint}</span>}
    </div>
  );
}

const DRAFTS_LIST_CACHE_KEY = 'drafts:list';

export function DocumentRegisterView({
  mode = 'register',
  listScope = 'register',
  onNewDocument,
  onDocumentClick,
  onOpenArchives,
  refreshKey = 0,
}: {
  mode?: 'new' | 'register';
  /** When `drafts`, lists only the logged-in user's unsubmitted drafts (same table UI as Document Control). */
  listScope?: 'register' | 'drafts';
  onNewDocument?: () => void;
  onDocumentClick?: (documentId: string, options?: { edit?: boolean; beginRevision?: boolean }) => void;
  onOpenArchives?: () => void;
  onSubmittedForApproval?: () => void;
  refreshKey?: number;
}) {
  const { user } = useAuth();
  const teamUsers = useTeamUsers();
  const ownerNames = teamUsers.map((entry) => entry.name);
  const isDraftsScope = listScope === 'drafts';
  const showForm = mode === 'new' && !isDraftsScope;
  const showRegister = mode === 'register' || isDraftsScope;
  const registerCache = getCachedData<RegisterListCache>(REGISTER_LIST_CACHE_KEY);
  const draftsCache = getCachedData<DocumentRecord[]>(DRAFTS_LIST_CACHE_KEY);
  const [documents, setDocuments] = useState<DocumentRecord[]>(
    isDraftsScope ? (draftsCache ?? []) : (registerCache?.documents ?? []),
  );
  const [archives, setArchives] = useState<DocumentArchiveRecord[]>(registerCache?.archives ?? []);
  const [showSkeleton, setShowSkeleton] = useState(isDraftsScope ? !draftsCache : !registerCache);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const { error, success, successFadingOut, showSuccess, showError } = useFlashMessages();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [archivingId, setArchivingId] = useState<string | null>(null);
  const registerActionBusy = isSaving || Boolean(deletingId) || Boolean(archivingId);
  const [viewingPdfId, setViewingPdfId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<DocumentRegisterStatusFilter>('all');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [historyDocument, setHistoryDocument] = useState<DocumentRecord | null>(null);
  const [historyEvents, setHistoryEvents] = useState<DocumentEventRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const [commentsDocument, setCommentsDocument] = useState<DocumentRecord | null>(null);
  const [commentsBlockReason, setCommentsBlockReason] = useState<DocumentCommentsBlockReason | null>(
    null,
  );

  function handleCommentsClick(doc: DocumentRecord) {
    const blockReason = getDocumentCommentsBlockReason(doc, user);
    if (blockReason) {
      setCommentsBlockReason(blockReason);
      return;
    }
    setCommentsDocument(doc);
  }

  const commentsBlockCopy =
    commentsBlockReason === 'self_owner_pending'
      ? {
          title: 'Document chat unavailable',
          message:
            'You submitted this document for approval, but you are also the document owner. Use document chat after you assign another person as owner, or once someone else is involved in approval.',
        }
      : {
          title: 'You created and approved this document',
          message:
            'You created this document and approved it as document owner. Document chat is available when someone else is the owner or approver—for example, after you submit a document for another person to approve.',
        };

  const loadDocuments = useCallback(async () => {
    try {
      if (isDraftsScope) {
        await runCachedScreenLoad<DocumentRecord[]>({
          cacheKey: DRAFTS_LIST_CACHE_KEY,
          fetcher: async () => {
            const { documents: data } = await api.getMyDrafts();
            return data;
          },
          onData: setDocuments,
          setShowSkeleton,
        });
        return;
      }

      await runCachedScreenLoad<RegisterListCache>({
        cacheKey: REGISTER_LIST_CACHE_KEY,
        fetcher: async () => {
          const [docsResult, archivesResult] = await Promise.all([
            api.getDocuments(),
            api.getDocumentArchives().catch(() => ({ archives: [], total: 0 })),
          ]);
          return { documents: docsResult.documents, archives: archivesResult.archives };
        },
        onData: ({ documents: nextDocs, archives: nextArchives }) => {
          setDocuments(nextDocs);
          setArchives(nextArchives);
        },
        setShowSkeleton,
      });
    } catch (err) {
      showError(
        err instanceof Error
          ? err.message
          : isDraftsScope
            ? 'Failed to load drafts'
            : 'Failed to load documents',
      );
      setShowSkeleton(false);
    }
  }, [isDraftsScope, showError]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments, refreshKey]);


  function updateField<K extends keyof typeof emptyForm>(key: K, value: (typeof emptyForm)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleClear() {
    setForm(emptyForm);
  }

  function getDocumentLabel(doc: DocumentRecord) {
    if (doc.documentOrigin === 'External') return doc.externalRef || doc.title;
    return doc.code || doc.title;
  }

  async function handleViewDocumentPdf(doc: DocumentRecord) {
    if (!doc.fileName) {
      showError('This document has no file attached yet.');
      return;
    }
    setViewingPdfId(doc.id);

    try {
      const blob = await fetchDocumentFileBlob(doc.id);
      const objectUrl = URL.createObjectURL(blob);
      const opened = window.open(objectUrl, '_blank', 'noopener,noreferrer');
      if (!opened) {
        URL.revokeObjectURL(objectUrl);
        showError('Allow pop-ups in your browser to view the document.');
        return;
      }
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Unable to open the document file.');
    } finally {
      setViewingPdfId(null);
    }
  }

  async function handleDelete(doc: DocumentRecord) {
    const label = getDocumentLabel(doc);
    if (!window.confirm(`Delete document "${label}"? This action cannot be undone.`)) return;

    setDeletingId(doc.id);

    try {
      await runWithMinDuration(async () => {
        await api.deleteDocument(doc.id);
        setDocuments((prev) => prev.filter((item) => item.id !== doc.id));
      });
      showSuccess(`Document "${label}" deleted.`);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to delete document');
    } finally {
      setDeletingId(null);
    }
  }

  async function handleArchive(doc: DocumentRecord) {
    const label = getDocumentDisplayCode(doc) || getDocumentLabel(doc);
    if (
      !window.confirm(
        `Archive document "${label}"? It will be removed from Document Control and kept in Document Archives.`,
      )
    ) {
      return;
    }

    setArchivingId(doc.id);
    try {
      await runWithMinDuration(async () => {
        await api.archiveDocument(doc.id);
        setDocuments((prev) => prev.filter((item) => item.id !== doc.id));
      });
      invalidateCachedData('register:list');
      invalidateCachedData('archives:list');
      showSuccess(`Document "${label}" archived.`);
      onOpenArchives?.();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to archive document');
    } finally {
      setArchivingId(null);
    }
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setIsSaving(true);

    try {
      const payload: CreateDocumentPayload = {
        type: form.type,
        process: form.process,
        title: form.title,
        version: Number(form.version) || 1,
        documentOrigin: form.documentOrigin || undefined,
        owner: form.owner || undefined,
        approvedBy: form.approvedBy || undefined,
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
      };

      const { document } = await runWithMinDuration(() => api.createDocument(payload));
      setDocuments((prev) => [document, ...prev]);
      setForm(emptyForm);
      showSuccess(`Document "${document.code}" created successfully.`);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to create document');
    } finally {
      setIsSaving(false);
    }
  }

  const filteredDocuments = useMemo(
    () =>
      documents.filter((doc) => {
        if (!isDraftsScope) {
          if (statusFilter === 'active' && doc.status !== 'Active') return false;
          if (statusFilter === 'pending' && !isRegisterPendingDocument(doc)) return false;
        }
        if (typeFilter && doc.type !== typeFilter) return false;
        return matchesTitleOrCode(searchQuery, doc);
      }),
    [documents, searchQuery, typeFilter, statusFilter, isDraftsScope],
  );

  const typeOptionsInRegister = useMemo(() => {
    const inDocs = new Set(documents.map((doc) => doc.type).filter(Boolean));
    const ordered: string[] = DOCUMENT_TYPES.filter((type) => inDocs.has(type));
    for (const type of inDocs) {
      if (!ordered.includes(type)) ordered.push(type);
    }
    return ordered.sort((a, b) => a.localeCompare(b));
  }, [documents]);

  function handleExportRegister() {
    const exportRows =
      selectedIds.size > 0
        ? filteredDocuments.filter((doc) => selectedIds.has(doc.id))
        : filteredDocuments;
    if (exportRows.length === 0) {
      showError('No documents to export. Adjust filters or select rows.');
      return;
    }
    const stem =
      typeFilter.trim().replace(/\s+/g, '-').toLowerCase() ||
      (isDraftsScope ? 'my-drafts' : 'document-control');
    downloadDocumentRegisterCsv(exportRows, stem);
    showSuccess(`Exported ${exportRows.length} document(s) to CSV.`);
  }

  function clearRegisterFilters() {
    setTypeFilter('');
    setSearchQuery('');
  }

  const {
    pagedItems: pagedDocuments,
    page,
    setPage,
    pageSize,
    setPageSize,
    total,
  } = usePaginatedSlice(filteredDocuments, searchQuery);
  const previewCode = useMemo(
    () => (form.type && form.process ? generateDocumentCode(form.type, form.process, documents.map((d) => d.code)) : ''),
    [form.type, form.process, documents],
  );

  const allSelected =
    pagedDocuments.length > 0 && pagedDocuments.every((doc) => selectedIds.has(doc.id));

  function toggleSelectAll() {
    if (allSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        pagedDocuments.forEach((doc) => next.delete(doc.id));
        return next;
      });
      return;
    }
    setSelectedIds((prev) => {
      const next = new Set(prev);
      pagedDocuments.forEach((doc) => next.add(doc.id));
      return next;
    });
  }

  async function openReviewHistory(doc: DocumentRecord) {
    const historyCacheKey = `review-history:events:${doc.id}`;
    const cachedEvents = getCachedData<DocumentEventRecord[]>(historyCacheKey);

    setHistoryDocument(doc);
    setHistoryEvents(cachedEvents ?? []);
    setHistoryError('');

    try {
      const [events] = await Promise.all([
        runCachedScreenLoad({
          cacheKey: historyCacheKey,
          fetcher: async () => {
            const { timelines } = await api.getDocumentEvents(doc.id);
            return timelines[0]?.events ?? [];
          },
          onData: setHistoryEvents,
          setShowSkeleton: setHistoryLoading,
        }),
        api.getDocumentArchives().then(({ archives: nextArchives }) => {
          setArchives(nextArchives);
        }).catch(() => undefined),
      ]);
      void events;
    } catch (err) {
      setHistoryError(err instanceof Error ? err.message : 'Failed to load review history');
      setHistoryLoading(false);
    }
  }

  function closeReviewHistory() {
    setHistoryDocument(null);
    setHistoryEvents([]);
    setHistoryError('');
    setHistoryLoading(false);
  }

  const historyArchives = useMemo(
    () =>
      historyDocument
        ? archives.filter((row) => row.sourceDocumentId === historyDocument.id)
        : [],
    [archives, historyDocument],
  );

  const reviewHistorySteps = useMemo(
    () =>
      historyDocument
        ? buildDocumentReviewTimeline(historyDocument, historyEvents, teamUsers, historyArchives)
        : [],
    [historyDocument, historyEvents, teamUsers, historyArchives],
  );

  const reviewHistoryTableRows = useMemo(
    () =>
      historyDocument
        ? buildDocumentReviewHistoryRows(historyDocument, historyEvents, historyArchives)
        : [],
    [historyDocument, historyEvents, historyArchives],
  );

  function toggleSelectRow(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  async function copyRegisterValue(value: string) {
    if (!value || value === '—') return;
    try {
      await navigator.clipboard.writeText(value);
      showSuccess('Copied to clipboard.');
    } catch {
      showError('Could not copy to clipboard.');
    }
  }

  return (
    <div className="doc-register doc-register-mock">
      <DarosActionLoadingOverlay active={registerActionBusy} />
      {(error || success) && (
        <div
          className={`doc-alert ${error ? 'doc-alert-error' : 'doc-alert-success flash-alert-success'}${
            success && successFadingOut ? ' flash-alert-fade-out' : ''
          }`}
        >
          {error || success}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSave}>
          <section className="doc-card">
            <div className="doc-card-header">
              <div className="doc-card-title-group">
                <div className="doc-card-icon doc-card-icon-blue">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <path d="M14 2v6h6M12 11v6M9 14h6" />
                  </svg>
                </div>
                <div>
                  <h2 className="doc-card-title">New Document</h2>
                  <p className="doc-card-subtitle">Create a new controlled document record</p>
                </div>
              </div>
              <div className="doc-card-actions">
                <button type="button" className="doc-btn doc-btn-outline" onClick={handleClear}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                  </svg>
                  Clear
                </button>
                <button type="submit" className="doc-btn doc-btn-primary" disabled={isSaving}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <path d="M17 21v-8H7v8M7 3v5h8" />
                  </svg>
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>

            <div className="doc-form-grid">
            <FormField label="Document Type" required>
              <DocumentTypeMenu
                value={form.type}
                onChange={(v) => updateField('type', v)}
              />
            </FormField>

            <FormField label="Process" required>
              <ProcessMenu
                value={form.process}
                onChange={(v) => updateField('process', v)}
              />
            </FormField>

            <FormField label="Document Code" required hint="Automatically generated from document type and process">
              <input className="doc-input" type="text" value={previewCode || '—'} readOnly />
            </FormField>

            <FormField label="Version" required>
              <input
                className="doc-input"
                type="number"
                min="1"
                value={form.version}
                onChange={(e) => updateField('version', e.target.value)}
                required
              />
            </FormField>

            <FormField label="Document Title" required>
              <input
                className="doc-input"
                type="text"
                placeholder="Enter document title"
                value={form.title}
                onChange={(e) => updateField('title', e.target.value)}
                required
              />
            </FormField>

            <FormField label="Document Origin" required>
              <RegisterSelect
                value={form.documentOrigin}
                onChange={(v) => updateField('documentOrigin', v)}
                options={ORIGINS}
                includeStandard={false}
              />
            </FormField>

            <FormField label="Document Owner" required hint="Person responsible for approving this document">
              <RegisterSelect
                value={form.owner}
                onChange={(v) => updateField('owner', v)}
                options={ownerNames}
                placeholder="Select owner..."
              />
            </FormField>

            <FormField label="Approved By">
              <RegisterSelect
                value={form.approvedBy}
                onChange={(v) => updateField('approvedBy', v)}
                options={ownerNames}
                placeholder="Set automatically on approval"
                disabled
              />
            </FormField>

            <FormField label="Department" required>
              <RegisterSelect
                value={form.department}
                onChange={(v) => updateField('department', v)}
                options={DEPARTMENTS}
                placeholder="Select department..."
              />
            </FormField>

            <FormField label="Effective Date" required>
              <div className="doc-date-wrap">
                <input
                  className="doc-input doc-date"
                  type="date"
                  value={form.effectiveDate}
                  onChange={(e) => updateField('effectiveDate', e.target.value)}
                />
                <span className="doc-date-icon"><CalendarIcon /></span>
              </div>
            </FormField>

            <FormField label="Review Frequency" required>
              <RegisterSelect
                value={form.reviewFrequency}
                onChange={(v) => updateField('reviewFrequency', v)}
                options={FREQUENCIES}
                placeholder="Select frequency..."
              />
            </FormField>

            <FormField label="Next Review Date">
              <div className="doc-date-wrap">
                <input
                  className="doc-input doc-date"
                  type="date"
                  value={form.nextReviewDate}
                  onChange={(e) => updateField('nextReviewDate', e.target.value)}
                />
                <span className="doc-date-icon"><CalendarIcon /></span>
              </div>
            </FormField>

            <FormField label="Repository / Location" required>
              <RegisterSelect
                value={form.repository}
                onChange={(v) => updateField('repository', v)}
                options={LOCATIONS}
                placeholder="Select location..."
              />
            </FormField>

            <FormField label="Distribution / Access" required>
              <RegisterSelect
                value={form.distribution}
                onChange={(v) => updateField('distribution', v)}
                options={ACCESS_LEVELS}
                placeholder="Select access..."
              />
            </FormField>

            <FormField label="Retention Period" required>
              <RegisterSelect
                value={form.retentionPeriod}
                onChange={(v) => updateField('retentionPeriod', v)}
                options={RETENTION_PERIODS}
                placeholder="Select period..."
              />
            </FormField>

            <FormField label="Retention Notes" wide>
              <input
                className="doc-input"
                type="text"
                placeholder="Additional retention notes..."
                value={form.retentionNotes}
                onChange={(e) => updateField('retentionNotes', e.target.value)}
              />
            </FormField>

            <FormField label="Disposition" required>
              <RegisterSelect
                value={form.disposition}
                onChange={(v) => updateField('disposition', v)}
                options={DISPOSITIONS}
                placeholder="Select disposition..."
              />
            </FormField>

            <FormField label="Comments" wide>
              <textarea
                className="doc-input doc-textarea"
                rows={3}
                placeholder="Additional comments..."
                value={form.comments}
                onChange={(e) => updateField('comments', e.target.value)}
              />
            </FormField>
          </div>
        </section>
      </form>
      )}

      {showRegister && (
      <>
        <header className="doc-reg-page-hero">
          <h1 className="doc-reg-hero-title">{isDraftsScope ? 'My Drafts' : 'Document Control'}</h1>
          <p className="doc-reg-hero-subtitle">
            {isDraftsScope
              ? 'Documents saved as draft and have not submitted yet'
              : 'Manage and track all your documents in one place'}
          </p>
        </header>
        {!isDraftsScope &&
          (showSkeleton ? (
            <RegisterStatsSkeleton />
          ) : (
            <DocumentRegisterStats
              documents={documents}
              archives={archives}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              onOpenArchives={onOpenArchives}
            />
          ))}

      <section className="doc-card doc-reg-card">
        <div className="doc-reg-toolbar doc-reg-toolbar-top">
          <ListSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            className="doc-reg-search"
            placeholder="Search by title, code, or keyword…"
            showShortcutHint
          />
          <div className="doc-reg-toolbar-right">
            <ListPageSizeSelect pageSize={pageSize} onPageSizeChange={setPageSize} />
            <button
              type="button"
              className={`doc-btn doc-btn-outline${filtersOpen || typeFilter ? ' doc-btn-outline-active' : ''}`}
              aria-expanded={filtersOpen}
              onClick={() => setFiltersOpen((open) => !open)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 3H2l8 9.46V19l4-2v-4.54L22 3z" />
              </svg>
              Filters{typeFilter ? ' (1)' : ''}
            </button>
            <button type="button" className="doc-btn doc-btn-outline" onClick={handleExportRegister}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              Export
            </button>
            <button
              type="button"
              className="doc-btn doc-btn-primary"
              onClick={() => onNewDocument?.()}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
              New Document
            </button>
          </div>
        </div>

        {filtersOpen ? (
          <div className="doc-reg-filters-panel">
            <div className="doc-reg-filter-field">
              <label htmlFor="doc-reg-type-filter">Document type</label>
              <select
                id="doc-reg-type-filter"
                className="doc-input doc-reg-filter-select"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">All document types</option>
                {typeOptionsInRegister.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            {typeFilter || searchQuery ? (
              <button type="button" className="doc-btn doc-btn-outline doc-reg-filter-clear" onClick={clearRegisterFilters}>
                Clear filters
              </button>
            ) : null}
          </div>
        ) : null}

        <div className="doc-reg-table-wrap">
          {showSkeleton ? (
            <DocumentTableSkeleton />
          ) : documents.length === 0 ? (
            <div className="doc-register-empty-state">
              <EmptyDraftsLottie />
              <h3 className="doc-register-empty-title">
                {isDraftsScope ? 'You have no draft documents yet' : 'No documents yet'}
              </h3>
              <p className="doc-register-empty-text">
                {isDraftsScope
                  ? 'When you save a document as draft, it will appear here ready for you to continue editing.'
                  : 'When you create or submit a document, it will appear here in the register.'}
              </p>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="doc-register-empty-state">
              <h3 className="doc-register-empty-title">
                {isDraftsScope ? 'No matching drafts' : 'No matching documents'}
              </h3>
              <p className="doc-register-empty-text">
                Try a different search, document type filter, or code.
              </p>
            </div>
          ) : (
            <table className="doc-reg-table doc-control-table">
              <colgroup>
                <col className="doc-reg-col-check-col" />
                <col />
                <col className="doc-reg-col-status" />
                <col className="doc-reg-col-code" />
                <col />
                <col />
                <col className="doc-reg-col-process" />
                <col className="doc-reg-col-owner" />
                <col className="doc-reg-col-actions-col" />
              </colgroup>
              <thead>
                <tr>
                  <th className="doc-reg-col-check">
                    <input
                      type="checkbox"
                      className="doc-reg-checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      aria-label="Select all documents"
                    />
                  </th>
                  <th>Origin <SortIcon /></th>
                  <th className="doc-reg-col-status">Status <SortIcon /></th>
                  <th className="doc-reg-col-code">Document Code <SortIcon /></th>
                  <th>Document Title <SortIcon /></th>
                  <th>Document Type <SortIcon /></th>
                  <th className="doc-reg-col-process">Process <SortIcon /></th>
                  <th className="doc-reg-col-owner">Owner <SortIcon /></th>
                  <th className="doc-reg-col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pagedDocuments.map((doc) => {
                  const registerCode = getDocumentDisplayCode(doc) || '—';
                  const ownerDisplay = getDocumentRegisterOwnerDisplay(doc, teamUsers);

                  return (
                    <tr
                      key={doc.id}
                      className={`doc-reg-row ${selectedIds.has(doc.id) ? 'selected' : ''}`}
                    >
                      <td className="doc-reg-col-check">
                        <input
                          type="checkbox"
                          className="doc-reg-checkbox"
                          checked={selectedIds.has(doc.id)}
                          onChange={() => toggleSelectRow(doc.id)}
                          aria-label={`Select ${doc.title}`}
                        />
                      </td>
                      <td>
                        <div className="doc-reg-origin-cell">
                          <span className="doc-reg-bookmark" aria-hidden="true">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                            </svg>
                          </span>
                          <span
                            className={`doc-reg-origin-icon ${doc.documentOrigin === 'External' ? 'external' : 'internal'}`}
                            title={doc.documentOrigin === 'External' ? 'External document' : 'Internal document'}
                          >
                            {doc.documentOrigin === 'External' ? (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                                <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" />
                                <path d="M3 9l2.5-5h13L21 9" />
                              </svg>
                            ) : (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                                <path d="M4 4h16v16H4z" />
                                <path d="m22 6-10 7L2 6" />
                              </svg>
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="doc-reg-col-status">
                        <span className={`doc-reg-pill ${getRegisterStatusClass(doc)}`}>
                          {getRegisterStatusLabel(doc)}
                        </span>
                      </td>
                      <td className="doc-reg-col-code">
                        <div className="doc-reg-code-cell">
                          <span className={`doc-reg-avatar ${getRegisterTypeAvatarClass(doc.type)}`}>
                            {getTypeAvatarLetter(doc)}
                          </span>
                          <div className="doc-reg-code-text">
                            <button
                              type="button"
                              className="doc-reg-code-link"
                              onClick={() => onDocumentClick?.(doc.id)}
                            >
                              {registerCode}
                            </button>
                            {registerCode !== '—' ? (
                              <button
                                type="button"
                                className="doc-reg-copy-btn"
                                title="Copy reference"
                                onClick={() => copyRegisterValue(registerCode)}
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <rect x="9" y="9" width="13" height="13" rx="2" />
                                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                </svg>
                              </button>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td className="doc-reg-title-cell">{doc.title}</td>
                      <td>
                        <span className={`doc-reg-type-pill ${documentTypeBadgeClass(doc.type)}`}>
                          <DocumentTypeIcon type={doc.type} />
                          {doc.type}
                        </span>
                      </td>
                      <td className="doc-reg-process-cell doc-reg-col-process">
                        <span className="doc-reg-process-inner">
                          <span className="doc-reg-process-icon" aria-hidden="true">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                              <path d="M3 7h18v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
                              <path d="M3 7l3-4h12l3 4" />
                            </svg>
                          </span>
                          {doc.process || '—'}
                        </span>
                      </td>
                      <td className="doc-reg-col-owner">
                        <div className="doc-reg-stack">
                          <span className="doc-reg-stack-primary">{ownerDisplay.primary}</span>
                          {ownerDisplay.metaLines.map((line) => (
                            <span
                              key={line}
                              className={`doc-reg-stack-secondary${
                                isRegisterOwnerMetaPositive(line) ? ' is-positive' : ''
                              }`}
                            >
                              {line}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="doc-reg-col-actions">
                        <DocumentRegisterTableActions
                          doc={doc}
                          user={user}
                          deletingId={deletingId}
                          archivingId={archivingId}
                          viewingPdfId={viewingPdfId}
                          onView={() => onDocumentClick?.(doc.id)}
                          onChat={() => handleCommentsClick(doc)}
                          onEdit={() => onDocumentClick?.(doc.id, { edit: true })}
                          onBeginRevision={() => onDocumentClick?.(doc.id, { beginRevision: true })}
                          onHistory={() => void openReviewHistory(doc)}
                          onOpenFile={() => void handleViewDocumentPdf(doc)}
                          onDelete={() => handleDelete(doc)}
                          onArchive={() => void handleArchive(doc)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <ListPaginationFooter
          total={total}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          itemLabel={isDraftsScope ? 'drafts' : 'entries'}
        />
      </section>
      </>
      )}

      <DocumentReviewHistoryDialog
        open={Boolean(historyDocument)}
        documentRecord={historyDocument}
        steps={reviewHistorySteps}
        tableRows={reviewHistoryTableRows}
        isLoading={historyLoading}
        error={historyError}
        onClose={closeReviewHistory}
      />

      <ConfirmDialog
        open={commentsBlockReason !== null}
        title={commentsBlockCopy.title}
        message={commentsBlockCopy.message}
        confirmLabel="Back"
        cancelLabel=""
        singleAction
        onConfirm={() => setCommentsBlockReason(null)}
        onCancel={() => setCommentsBlockReason(null)}
      />

      {commentsDocument ? (
        <DocumentCommentsChat
          open
          documentRecord={commentsDocument}
          onClose={() => setCommentsDocument(null)}
        />
      ) : null}
    </div>
  );
}
