import { type FormEvent, type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { api, type CreateDocumentPayload, type DocumentRecord } from '../../../lib/api';
import { documentTypeBadgeClass } from '../../../data/documentRegister';
import { useTeamUsers } from '../../../context/TeamUsersContext';
import { canUserDeleteDocument, isDocumentOwnerSameAsUser } from '../../../lib/documentUsers';
import { useAuth } from '../../../context/AuthContext';
import { generateDocumentCode } from '../../../lib/documentCode';
import {
  getDocumentStatusLabel,
  isPendingApprovalDocument,
  isRejectedDocument,
} from '../../../lib/documentStatus';
import { replaceDocumentSourceFile } from '../../../lib/documentSourceFile';
import { DocumentTypeMenu } from './DocumentTypeMenu';
import { ProcessMenu } from './ProcessMenu';
import { EmptyDraftsLottie } from './EmptyDraftsLottie';
import { ConfirmDialog } from '../../../components/dialogs/ConfirmDialog';
import { UploadRejectedDocumentDialog } from '../../../components/dialogs/UploadRejectedDocumentDialog';
import { ListSearchBar } from '../../../components/common/ListSearchBar';
import { matchesTitleOrCode } from '../../../lib/search/documentSearch';
import { RegisterSelect } from './RegisterSelect';
import { DocumentReviewHistoryDialog } from './DocumentReviewHistoryDialog';
import { buildDocumentReviewHistoryRows } from '../utils/reviewHistory';
import type { DocumentEventRecord } from '../../../types/audit';
import './DocumentRegisterView.css';


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

function getOwnerInitials(name?: string) {
  if (!name?.trim()) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}

function getRegisterStatusLabel(doc: DocumentRecord) {
  const label = getDocumentStatusLabel(doc);
  if (label === 'Pending Approval') return 'PENDING';
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

export function DocumentRegisterView({
  mode = 'register',
  onNewDocument,
  onDocumentClick,
  onSubmittedForApproval,
  onOpenHistory,
  refreshKey = 0,
}: {
  mode?: 'new' | 'register';
  onNewDocument?: () => void;
  onDocumentClick?: (documentId: string, options?: { edit?: boolean }) => void;
  onSubmittedForApproval?: () => void;
  onOpenHistory?: (documentId: string) => void;
  refreshKey?: number;
}) {
  const { user } = useAuth();
  const teamUsers = useTeamUsers();
  const ownerNames = teamUsers.map((entry) => entry.name);
  const showForm = mode === 'new';
  const showRegister = mode === 'register';
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [changingFileId, setChangingFileId] = useState<string | null>(null);
  const [resubmittingId, setResubmittingId] = useState<string | null>(null);
  const [pendingResubmit, setPendingResubmit] = useState<DocumentRecord | null>(null);
  const [uploadDialogDoc, setUploadDialogDoc] = useState<DocumentRecord | null>(null);
  const [pendingUploadResubmit, setPendingUploadResubmit] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [historyDocument, setHistoryDocument] = useState<DocumentRecord | null>(null);
  const [historyEvents, setHistoryEvents] = useState<DocumentEventRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');

  const loadDocuments = useCallback(async () => {
    setError('');
    try {
      const { documents: data } = await api.getDocuments();
      setDocuments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments, refreshKey]);

  function isDocumentCreator(doc: DocumentRecord) {
    return (user?.email?.toLowerCase() ?? '') === (doc.createdBy?.toLowerCase() ?? '');
  }

  function canManageRejectedDocument(doc: DocumentRecord) {
    return isRejectedDocument(doc) && isDocumentCreator(doc) && doc.documentOrigin !== 'External';
  }

  function handleUploadNewDocumentClick(doc: DocumentRecord) {
    setUploadDialogDoc(doc);
  }

  async function handleUploadRejectedDocument(file: File, resubmit: boolean) {
    if (!uploadDialogDoc) return;

    const doc = uploadDialogDoc;
    setError('');
    setSuccess('');
    setChangingFileId(doc.id);

    try {
      const updated = await replaceDocumentSourceFile(doc.id, file);
      let nextDocument = updated;

      if (resubmit) {
        if (isDocumentOwnerSameAsUser(user, doc.owner)) {
          setPendingUploadResubmit(true);
          setUploadDialogDoc(nextDocument);
          setDocuments((prev) => prev.map((item) => (item.id === doc.id ? nextDocument : item)));
          setSuccess(`New document uploaded for "${nextDocument.title}". Confirm resubmission to send it for approval.`);
          return;
        }

        const { document: submitted } = await api.submitDocumentForApproval(doc.id);
        nextDocument = submitted;
        onSubmittedForApproval?.();
        setSuccess(`New document uploaded and "${submitted.title}" resubmitted for approval.`);
      } else {
        setSuccess(`New document uploaded for "${updated.title}". You can resubmit for approval when ready.`);
      }

      setDocuments((prev) => prev.map((item) => (item.id === doc.id ? nextDocument : item)));
      setUploadDialogDoc(null);
      setPendingUploadResubmit(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload new document');
    } finally {
      setChangingFileId(null);
    }
  }

  async function confirmUploadAndResubmit() {
    if (!uploadDialogDoc) return;

    setResubmittingId(uploadDialogDoc.id);
    setError('');
    setSuccess('');

    try {
      const { document: submitted } = await api.submitDocumentForApproval(uploadDialogDoc.id);
      setDocuments((prev) => prev.map((item) => (item.id === submitted.id ? submitted : item)));
      setSuccess(`"${submitted.title}" resubmitted for approval.`);
      setUploadDialogDoc(null);
      setPendingUploadResubmit(false);
      onSubmittedForApproval?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resubmit document');
    } finally {
      setResubmittingId(null);
    }
  }

  async function resubmitDocument(doc: DocumentRecord) {
    setError('');
    setSuccess('');
    setResubmittingId(doc.id);

    try {
      const { document: updated } = await api.submitDocumentForApproval(doc.id);
      setDocuments((prev) => prev.map((item) => (item.id === doc.id ? updated : item)));
      setSuccess(`"${updated.title}" resubmitted for approval.`);
      onSubmittedForApproval?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resubmit document');
    } finally {
      setResubmittingId(null);
      setPendingResubmit(null);
    }
  }

  function handleResubmitClick(doc: DocumentRecord) {
    if (isDocumentOwnerSameAsUser(user, doc.owner)) {
      setPendingResubmit(doc);
      return;
    }
    void resubmitDocument(doc);
  }

  function updateField<K extends keyof typeof emptyForm>(key: K, value: (typeof emptyForm)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleClear() {
    setForm(emptyForm);
    setSuccess('');
    setError('');
  }

  function getDocumentLabel(doc: DocumentRecord) {
    if (doc.documentOrigin === 'External') return doc.externalRef || doc.title;
    return doc.code || doc.title;
  }

  async function handleDelete(doc: DocumentRecord) {
    const label = getDocumentLabel(doc);
    if (!window.confirm(`Delete document "${label}"? This action cannot be undone.`)) return;

    setError('');
    setSuccess('');
    setDeletingId(doc.id);

    try {
      await api.deleteDocument(doc.id);
      setDocuments((prev) => prev.filter((item) => item.id !== doc.id));
      setSuccess(`Document "${label}" deleted.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete document');
    } finally {
      setDeletingId(null);
    }
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
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

      const { document } = await api.createDocument(payload);
      setDocuments((prev) => [document, ...prev]);
      setSuccess(`Document "${document.code}" created successfully.`);
      setForm(emptyForm);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create document');
    } finally {
      setIsSaving(false);
    }
  }

  const filteredDocuments = useMemo(
    () => documents.filter((doc) => matchesTitleOrCode(searchQuery, doc)),
    [documents, searchQuery],
  );

  const total = filteredDocuments.length;
  const showingFrom = total === 0 ? 0 : 1;
  const showingTo = Math.min(5, total);
  const previewCode = useMemo(
    () => (form.type && form.process ? generateDocumentCode(form.type, form.process, documents.map((d) => d.code)) : ''),
    [form.type, form.process, documents],
  );

  const allSelected =
    filteredDocuments.length > 0 && filteredDocuments.every((doc) => selectedIds.has(doc.id));

  function toggleSelectAll() {
    if (allSelected) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(new Set(filteredDocuments.map((doc) => doc.id)));
  }

  async function openReviewHistory(doc: DocumentRecord) {
    setHistoryDocument(doc);
    setHistoryEvents([]);
    setHistoryError('');
    setHistoryLoading(true);

    try {
      const { timelines } = await api.getDocumentEvents(doc.id);
      setHistoryEvents(timelines[0]?.events ?? []);
    } catch (err) {
      setHistoryError(err instanceof Error ? err.message : 'Failed to load review history');
    } finally {
      setHistoryLoading(false);
    }
  }

  function closeReviewHistory() {
    setHistoryDocument(null);
    setHistoryEvents([]);
    setHistoryError('');
    setHistoryLoading(false);
  }

  const reviewHistoryRows = useMemo(
    () =>
      historyDocument
        ? buildDocumentReviewHistoryRows(historyDocument, historyEvents)
        : [],
    [historyDocument, historyEvents],
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
      setSuccess('Copied to clipboard.');
    } catch {
      setError('Could not copy to clipboard.');
    }
  }

  return (
    <div className="doc-register">
      {(error || success) && (
        <div className={`doc-alert ${error ? 'doc-alert-error' : 'doc-alert-success'}`}>
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
      <section className="doc-card">
        <div className="doc-card-header">
          <div className="doc-card-title-group">
            <div className="doc-card-icon doc-card-icon-blue">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
              </svg>
            </div>
            <div>
              <h2 className="doc-card-title">Document Register</h2>
              <p className="doc-card-subtitle">Manage and track all controlled documents</p>
            </div>
          </div>
          <div className="doc-card-actions">
            <button type="button" className="doc-btn doc-btn-outline">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 3H2l8 9.46V19l4-2v-4.54L22 3z" />
              </svg>
              Filters
            </button>
            <button type="button" className="doc-btn doc-btn-outline">
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

        <div className="doc-card-toolbar">
          <ListSearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>

        <div className="doc-reg-table-wrap">
          {isLoading ? (
            <div className="doc-table-loading">Loading documents...</div>
          ) : documents.length === 0 ? (
            <div className="doc-register-empty-state">
              <EmptyDraftsLottie />
              <h3 className="doc-register-empty-title">No documents yet</h3>
              <p className="doc-register-empty-text">
                When you create or submit a document, it will appear here in the register.
              </p>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="doc-register-empty-state">
              <h3 className="doc-register-empty-title">No matching documents</h3>
              <p className="doc-register-empty-text">
                Try a different title or document code.
              </p>
            </div>
          ) : (
            <table className="doc-reg-table">
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
                  <th>Status <SortIcon /></th>
                  <th className="doc-reg-col-info">Info</th>
                  <th>Document Code <SortIcon /></th>
                  <th>Document Title <SortIcon /></th>
                  <th>Document Type <SortIcon /></th>
                  <th>Process <SortIcon /></th>
                  <th>Owner <SortIcon /></th>
                  <th className="doc-reg-col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map((doc) => {
                  const registerCode =
                    doc.documentOrigin === 'External' ? doc.externalRef || '—' : doc.code || '—';

                  return (
                    <tr
                      key={doc.id}
                      className={`doc-reg-row ${selectedIds.has(doc.id) ? 'selected' : ''}`}
                    >
                      <td className="doc-reg-col-check">
                        <div className="doc-reg-check-cell">
                          <input
                            type="checkbox"
                            className="doc-reg-checkbox"
                            checked={selectedIds.has(doc.id)}
                            onChange={() => toggleSelectRow(doc.id)}
                            aria-label={`Select ${doc.title}`}
                          />
                          <span className="doc-reg-bookmark" aria-hidden="true">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                            </svg>
                          </span>
                        </div>
                      </td>
                      <td>
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
                      </td>
                      <td>
                        <span
                          className={`doc-reg-pill ${getRegisterStatusClass(doc)}`}
                          title={doc.rejectionReason || undefined}
                        >
                          {getRegisterStatusLabel(doc)}
                        </span>
                      </td>
                      <td className="doc-reg-col-info">
                        <button
                          type="button"
                          className="doc-reg-info-btn"
                          title="Document Review History"
                          aria-label="Open document review history"
                          onClick={(e) => {
                            e.stopPropagation();
                            void openReviewHistory(doc);
                          }}
                        >
                          ?
                        </button>
                      </td>
                      <td>
                        <div className="doc-reg-code-cell">
                          <span className="doc-reg-avatar">{getOwnerInitials(doc.owner)}</span>
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
                          {doc.type}
                        </span>
                      </td>
                      <td>
                        <div className="doc-reg-stack">
                          <span className="doc-reg-stack-primary">{doc.process || '—'}</span>
                          {doc.department ? (
                            <span className="doc-reg-stack-secondary">{doc.department}</span>
                          ) : null}
                        </div>
                      </td>
                      <td>
                        <div className="doc-reg-stack">
                          <span className="doc-reg-stack-primary">{doc.owner || '—'}</span>
                          {doc.approvedBy ? (
                            <span className="doc-reg-stack-secondary">Approved: {doc.approvedBy}</span>
                          ) : null}
                        </div>
                      </td>
                      <td className="doc-reg-col-actions">
                        {canManageRejectedDocument(doc) ? (
                          <div className="doc-resubmit-actions" onClick={(e) => e.stopPropagation()}>
                            {doc.rejectionReason ? (
                              <p className="doc-rejection-hint" title={doc.rejectionReason}>
                                {doc.rejectionReason}
                              </p>
                            ) : null}
                            <button
                              type="button"
                              className="doc-resubmit-btn"
                              disabled={changingFileId === doc.id || resubmittingId === doc.id}
                              onClick={() => handleUploadNewDocumentClick(doc)}
                            >
                              {changingFileId === doc.id ? 'Uploading...' : 'Upload new document'}
                            </button>
                            <button
                              type="button"
                              className="doc-resubmit-btn doc-resubmit-btn-primary"
                              disabled={changingFileId === doc.id || resubmittingId === doc.id}
                              onClick={() => handleResubmitClick(doc)}
                            >
                              {resubmittingId === doc.id ? 'Sending...' : 'Resubmit'}
                            </button>
                          </div>
                        ) : (
                          <div className="doc-reg-action-grid" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              className="doc-reg-round-btn"
                              title="History"
                              onClick={() => onOpenHistory?.(doc.id)}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                                <circle cx="12" cy="12" r="9" />
                                <path d="M12 7v5l3 2" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              className="doc-reg-round-btn"
                              title="Comments"
                              onClick={() => onDocumentClick?.(doc.id)}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              className="doc-reg-round-btn doc-reg-round-btn-primary"
                              title="Edit"
                              onClick={() => onDocumentClick?.(doc.id, { edit: true })}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                                <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z" />
                              </svg>
                            </button>
                            {canUserDeleteDocument(user, doc) ? (
                              <button
                                type="button"
                                className="doc-reg-round-btn doc-reg-round-btn-danger"
                                title="Delete"
                                disabled={deletingId === doc.id}
                                onClick={() => handleDelete(doc)}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                                  <path d="M3 6h18M8 6V4h8v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                                  <path d="M10 11v6M14 11v6" />
                                </svg>
                              </button>
                            ) : (
                              <span className="doc-reg-round-spacer" />
                            )}
                            <button
                              type="button"
                              className="doc-reg-round-btn"
                              title="View document"
                              onClick={() => onDocumentClick?.(doc.id)}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <path d="M14 2v6h6" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              className="doc-reg-round-btn"
                              title="Open"
                              onClick={() => onDocumentClick?.(doc.id)}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="doc-table-footer">
          <span className="doc-table-count">
            {total === 0
              ? 'No entries'
              : `Showing ${showingFrom} to ${showingTo} of ${total} entries`}
          </span>
          <div className="doc-pagination">
            <button type="button" className="doc-page-btn" disabled>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <button type="button" className="doc-page-btn active">1</button>
            {total > 5 && (
              <>
                <button type="button" className="doc-page-btn">2</button>
                <button type="button" className="doc-page-btn">3</button>
              </>
            )}
            <button type="button" className="doc-page-btn" disabled={total <= 5}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      </section>
      )}

      <UploadRejectedDocumentDialog
        open={Boolean(uploadDialogDoc) && !pendingUploadResubmit}
        documentRecord={uploadDialogDoc}
        onUpload={handleUploadRejectedDocument}
        onCancel={() => setUploadDialogDoc(null)}
        isSubmitting={Boolean(uploadDialogDoc && changingFileId === uploadDialogDoc.id)}
      />

      <ConfirmDialog
        open={Boolean(uploadDialogDoc && pendingUploadResubmit)}
        title="Confirm resubmission"
        message={
          uploadDialogDoc
            ? `You are both the document creator and the document owner. Upload complete for "${uploadDialogDoc.title}". Send it for approval now?`
            : ''
        }
        confirmLabel="Resubmit"
        cancelLabel="Not now"
        onConfirm={() => {
          void confirmUploadAndResubmit();
        }}
        onCancel={() => {
          setPendingUploadResubmit(false);
          setUploadDialogDoc(null);
        }}
      />

      <ConfirmDialog
        open={Boolean(pendingResubmit)}
        title="Confirm resubmission"
        message={
          pendingResubmit
            ? `You are both the document creator and the document owner. Are you sure "${pendingResubmit.title}" is ready to be submitted for approval again?`
            : ''
        }
        confirmLabel="Resubmit"
        cancelLabel="Cancel"
        onConfirm={() => {
          if (pendingResubmit) void resubmitDocument(pendingResubmit);
        }}
        onCancel={() => setPendingResubmit(null)}
      />

      <DocumentReviewHistoryDialog
        open={Boolean(historyDocument)}
        documentRecord={historyDocument}
        rows={reviewHistoryRows}
        isLoading={historyLoading}
        error={historyError}
        onClose={closeReviewHistory}
      />
    </div>
  );
}
