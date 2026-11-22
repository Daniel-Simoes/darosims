import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, fetchArchiveFileBlob } from '../../../lib/api';
import type { DocumentArchiveRecord } from '../../../types/documentArchive';
import { documentTypeBadgeClass } from '../../../data/documentRegister';
import { DOCUMENT_TYPES } from '../../../data/documentTypes';
import { formatRevisionVersionLabel } from '../../../lib/documents/documentVersionRevision';
import { formatDocumentCodeWithVersion } from '../../../lib/documents/documentCode';
import { ListSearchBar } from '../../../components/common/ListSearchBar';
import { ListPaginationFooter } from '../../../components/common/ListPaginationFooter';
import { ListPageSizeSelect } from '../../../components/common/ListPageSizeSelect';
import { usePaginatedSlice } from '../../../lib/pagination/usePaginatedSlice';
import {
  DocumentTypeIcon,
  getRegisterTypeAvatarClass,
  getTypeAvatarLetterForType,
} from '../utils/registerTypeAvatar';
import { DocumentArchivesTableActions } from './DocumentArchivesTableActions';
import { DocumentTableSkeleton } from '../../../components/common/skeletons/DashboardSkeletons';
import { EmptyDraftsLottie } from './EmptyDraftsLottie';
import { useAuth } from '../../../context/AuthContext';
import { canUserDeleteDocumentArchive } from '../../../lib/documentUsers';
import { getCachedData, invalidateCachedData } from '../../../lib/data/clientDataCache';
import { runWithMinDuration } from '../../../lib/ui/runWithMinDuration';
import { runCachedScreenLoad } from '../../../lib/ui/skeletonLoading';
import { useFlashMessages } from '../../../hooks/useFlashMessages';
import { downloadDocumentArchivesCsv } from '../utils/documentArchivesExport';
import './DocumentRegisterView.css';

function SortIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m7 15 5 5 5-5M7 9l5-5 5 5" />
    </svg>
  );
}

function formatDate(value?: string) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString();
}

function archiveDisplayCode(row: DocumentArchiveRecord): string {
  return formatDocumentCodeWithVersion(row.code, row.version) || row.code?.trim() || '—';
}

function matchesArchiveSearch(query: string, row: DocumentArchiveRecord): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const code = archiveDisplayCode(row).toLowerCase();
  return (
    row.title.toLowerCase().includes(q) ||
    code.includes(q) ||
    row.code.toLowerCase().includes(q) ||
    row.type.toLowerCase().includes(q) ||
    row.process.toLowerCase().includes(q)
  );
}

interface DocumentArchivesViewProps {
  refreshKey?: number;
  onOpenCurrentDocument?: (documentId: string) => void;
}

export function DocumentArchivesView({
  refreshKey = 0,
  onOpenCurrentDocument,
}: DocumentArchivesViewProps) {
  const ARCHIVES_CACHE_KEY = 'archives:list';
  const cachedArchives = getCachedData<DocumentArchiveRecord[]>(ARCHIVES_CACHE_KEY);
  const [archives, setArchives] = useState<DocumentArchiveRecord[]>(cachedArchives ?? []);
  const [showSkeleton, setShowSkeleton] = useState(!cachedArchives);
  const { error, success, successFadingOut, setError, showSuccess, showError } = useFlashMessages();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [viewingArchiveId, setViewingArchiveId] = useState<string | null>(null);
  const [deletingArchiveId, setDeletingArchiveId] = useState<string | null>(null);
  const { user } = useAuth();

  const loadArchives = useCallback(async () => {
    setError('');
    try {
      await runCachedScreenLoad({
        cacheKey: ARCHIVES_CACHE_KEY,
        fetcher: async () => {
          const { archives: data } = await api.getDocumentArchives();
          return data;
        },
        onData: setArchives,
        setShowSkeleton,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load archives');
      setShowSkeleton(false);
    }
  }, [setError]);

  useEffect(() => {
    loadArchives();
  }, [loadArchives, refreshKey]);

  const filteredArchives = useMemo(
    () =>
      archives.filter((row) => {
        if (typeFilter && row.type !== typeFilter) return false;
        return matchesArchiveSearch(searchQuery, row);
      }),
    [archives, searchQuery, typeFilter],
  );

  const typeOptionsInArchives = useMemo(() => {
    const inArchives = new Set(archives.map((row) => row.type).filter(Boolean));
    const ordered: string[] = DOCUMENT_TYPES.filter((type) => inArchives.has(type));
    for (const type of inArchives) {
      if (!ordered.includes(type)) ordered.push(type);
    }
    return ordered.sort((a, b) => a.localeCompare(b));
  }, [archives]);

  function clearArchiveFilters() {
    setTypeFilter('');
    setSearchQuery('');
  }

  function handleExportArchives() {
    if (filteredArchives.length === 0) {
      showError('No archives to export. Adjust filters or search.');
      return;
    }
    const stem =
      typeFilter.trim().replace(/\s+/g, '-').toLowerCase() || 'document-archives';
    downloadDocumentArchivesCsv(filteredArchives, stem);
    showSuccess(`Exported ${filteredArchives.length} archived version(s) to CSV.`);
  }

  const {
    pagedItems: pagedArchives,
    page,
    setPage,
    pageSize,
    setPageSize,
    total,
  } = usePaginatedSlice(filteredArchives, searchQuery);

  async function copyArchiveCode(value: string) {
    if (!value || value === '—') return;
    try {
      await navigator.clipboard.writeText(value);
      showSuccess('Copied to clipboard.');
    } catch {
      showError('Could not copy to clipboard.');
    }
  }

  async function handleDeleteArchive(row: DocumentArchiveRecord) {
    const code = archiveDisplayCode(row);
    const label = code !== '—' ? code : row.title;
    if (
      !window.confirm(
        `Delete archived version "${label}" (v${formatRevisionVersionLabel(row.version)})? This cannot be undone.`,
      )
    ) {
      return;
    }

    setDeletingArchiveId(row.id);
    try {
      await runWithMinDuration(async () => {
        await api.deleteDocumentArchive(row.id);
        setArchives((prev) => prev.filter((item) => item.id !== row.id));
      });
      invalidateCachedData(ARCHIVES_CACHE_KEY);
      showSuccess(`Archived version "${label}" deleted.`);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to delete archived version');
    } finally {
      setDeletingArchiveId(null);
    }
  }

  async function handleViewFile(row: DocumentArchiveRecord) {
    if (!row.fileName) return;
    setViewingArchiveId(row.id);
    try {
      const blob = await fetchArchiveFileBlob(row.id);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Unable to open archived file');
    } finally {
      setViewingArchiveId(null);
    }
  }

  return (
    <div className="doc-register doc-register-mock">
      {(error || success) && (
        <div
          className={`doc-alert ${error ? 'doc-alert-error' : 'doc-alert-success flash-alert-success'}${
            success && successFadingOut ? ' flash-alert-fade-out' : ''
          }`}
        >
          {error || success}
        </div>
      )}

      <header className="doc-reg-page-hero">
        <h1 className="doc-reg-hero-title">Document Archives</h1>
        <p className="doc-reg-hero-subtitle">
          Approved versions kept for reference when a newer revision is approved.
        </p>
      </header>

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
            <button type="button" className="doc-btn doc-btn-outline" onClick={handleExportArchives}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              Export
            </button>
          </div>
        </div>

        {filtersOpen ? (
          <div className="doc-reg-filters-panel">
            <div className="doc-reg-filter-field">
              <label htmlFor="doc-arch-type-filter">Document type</label>
              <select
                id="doc-arch-type-filter"
                className="doc-input doc-reg-filter-select"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">All document types</option>
                {typeOptionsInArchives.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            {typeFilter || searchQuery ? (
              <button
                type="button"
                className="doc-btn doc-btn-outline doc-reg-filter-clear"
                onClick={clearArchiveFilters}
              >
                Clear filters
              </button>
            ) : null}
          </div>
        ) : null}

        <div className="doc-reg-table-wrap">
          {showSkeleton ? (
            <DocumentTableSkeleton rows={6} />
          ) : archives.length === 0 ? (
            <div className="doc-register-empty-state">
              <EmptyDraftsLottie />
              <h3 className="doc-register-empty-title">No archived versions yet</h3>
              <p className="doc-register-empty-text">
                When a new revision is approved, the prior approved version will appear here.
              </p>
            </div>
          ) : filteredArchives.length === 0 ? (
            <div className="doc-register-empty-state">
              <h3 className="doc-register-empty-title">No matching archives</h3>
              <p className="doc-register-empty-text">
                Try a different search, document type filter, or code.
              </p>
            </div>
          ) : (
            <table className="doc-reg-table doc-archives-table">
              <colgroup>
                <col />
                <col className="doc-reg-col-arch-superseded" />
                <col className="doc-reg-col-arch-origin" />
                <col className="doc-reg-col-arch-code" />
                <col />
                <col className="doc-reg-col-arch-type" />
                <col className="doc-reg-col-process" />
                <col className="doc-reg-col-arch-date" />
                <col className="doc-reg-col-actions-col" />
              </colgroup>
              <thead>
                <tr>
                  <th>Version <SortIcon /></th>
                  <th className="doc-reg-col-arch-superseded">Superseded by <SortIcon /></th>
                  <th className="doc-reg-col-arch-origin">Origin <SortIcon /></th>
                  <th className="doc-reg-col-arch-code">Document Code <SortIcon /></th>
                  <th>Document Title <SortIcon /></th>
                  <th className="doc-reg-col-arch-type">Document Type <SortIcon /></th>
                  <th className="doc-reg-col-process">Process <SortIcon /></th>
                  <th className="doc-reg-col-arch-date">Archived <SortIcon /></th>
                  <th className="doc-reg-col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pagedArchives.map((row) => {
                  const registerCode = archiveDisplayCode(row);
                  const isExternal = row.documentOrigin === 'External';

                  return (
                    <tr key={row.id} className="doc-reg-row">
                      <td>
                        <span className="doc-reg-pill doc-reg-pill-draft">
                          V{formatRevisionVersionLabel(row.version)}
                        </span>
                      </td>
                      <td className="doc-reg-col-arch-superseded">
                        {row.supersededByVersion > 0 ? (
                          <span className="doc-reg-pill doc-reg-pill-sent">
                            V{formatRevisionVersionLabel(row.supersededByVersion)}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="doc-reg-col-arch-origin">
                        <div className="doc-reg-origin-cell">
                          <span className="doc-reg-bookmark" aria-hidden="true">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                            </svg>
                          </span>
                          <span
                            className={`doc-reg-origin-icon ${isExternal ? 'external' : 'internal'}`}
                            title={isExternal ? 'External document' : 'Internal document'}
                          >
                            {isExternal ? (
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
                      <td className="doc-reg-col-arch-code">
                        <div className="doc-reg-code-cell">
                          <span className={`doc-reg-avatar ${getRegisterTypeAvatarClass(row.type)}`}>
                            {getTypeAvatarLetterForType(row.type)}
                          </span>
                          <div className="doc-reg-code-text">
                            {onOpenCurrentDocument ? (
                              <button
                                type="button"
                                className="doc-reg-code-link"
                                onClick={() => onOpenCurrentDocument(row.sourceDocumentId)}
                              >
                                {registerCode}
                              </button>
                            ) : (
                              <span className="doc-reg-code-link">{registerCode}</span>
                            )}
                            {registerCode !== '—' ? (
                              <button
                                type="button"
                                className="doc-reg-copy-btn"
                                title="Copy reference"
                                onClick={() => void copyArchiveCode(registerCode)}
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
                      <td className="doc-reg-title-cell">{row.title}</td>
                      <td className="doc-reg-col-arch-type">
                        <span className={`doc-reg-type-pill ${documentTypeBadgeClass(row.type)}`}>
                          <DocumentTypeIcon type={row.type} />
                          {row.type}
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
                          {row.process || '—'}
                        </span>
                      </td>
                      <td className="doc-reg-col-arch-date">{formatDate(row.archivedAt)}</td>
                      <td className="doc-reg-col-actions">
                        <DocumentArchivesTableActions
                          row={row}
                          viewingArchiveId={viewingArchiveId}
                          canDelete={canUserDeleteDocumentArchive(user, row)}
                          deleting={deletingArchiveId === row.id}
                          onOpenCurrentDocument={
                            onOpenCurrentDocument
                              ? () => onOpenCurrentDocument(row.sourceDocumentId)
                              : undefined
                          }
                          onOpenArchiveFile={() => void handleViewFile(row)}
                          onDelete={() => void handleDeleteArchive(row)}
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
          itemLabel="archived versions"
        />
      </section>
    </div>
  );
}