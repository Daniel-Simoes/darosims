import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, fetchArchiveFileBlob } from '../../../lib/api';
import type { DocumentArchiveRecord } from '../../../types/documentArchive';
import { documentTypeBadgeClass } from '../../../data/documentRegister';
import { formatRevisionVersionLabel } from '../../../lib/documents/documentVersionRevision';
import { ListSearchBar } from '../../../components/common/ListSearchBar';
import { ListPaginationFooter } from '../../../components/common/ListPaginationFooter';
import { ListPageSizeSelect } from '../../../components/common/ListPageSizeSelect';
import { usePaginatedSlice } from '../../../lib/pagination/usePaginatedSlice';
import { DocumentTypeIcon, getRegisterTypeAvatarClass } from '../utils/registerTypeAvatar';
import { DocumentTableSkeleton } from '../../../components/common/skeletons/DashboardSkeletons';
import { getCachedData } from '../../../lib/data/clientDataCache';
import { runCachedScreenLoad } from '../../../lib/ui/skeletonLoading';
import { TYPE_PREFIX } from '../../../data/documentTypes';
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

function matchesArchiveSearch(query: string, row: DocumentArchiveRecord): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    row.title.toLowerCase().includes(q) ||
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
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingArchiveId, setViewingArchiveId] = useState<string | null>(null);

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
  }, []);

  useEffect(() => {
    loadArchives();
  }, [loadArchives, refreshKey]);

  const filteredArchives = useMemo(
    () => archives.filter((row) => matchesArchiveSearch(searchQuery, row)),
    [archives, searchQuery],
  );

  const {
    pagedItems: pagedArchives,
    page,
    setPage,
    pageSize,
    setPageSize,
    total,
  } = usePaginatedSlice(filteredArchives, searchQuery);

  async function handleViewFile(row: DocumentArchiveRecord) {
    if (!row.fileName) return;
    setViewingArchiveId(row.id);
    try {
      const blob = await fetchArchiveFileBlob(row.id);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to open archived file');
    } finally {
      setViewingArchiveId(null);
    }
  }

  return (
    <div className="doc-archives">
      {error ? <div className="doc-alert doc-alert-error">{error}</div> : null}

      <section className="doc-card doc-reg-card">
        <div className="doc-card-header doc-reg-toolbar-top">
          <div className="doc-card-title-group">
            <div className="doc-card-icon doc-card-icon-violet">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M3 7h18v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
                <path d="M3 7l3-4h12l3 4M10 11h4" />
              </svg>
            </div>
            <div>
              <h2 className="doc-card-title">Arquivos</h2>
              <p className="doc-card-subtitle">
                Versões anteriores arquivadas quando um documento passa a uma nova revisão (ex.: v1 → v1.1).
              </p>
            </div>
          </div>
        </div>

        <div className="doc-reg-toolbar doc-reg-toolbar-top">
          <ListSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            className="doc-reg-search"
            placeholder="Buscar por título, código ou tipo…"
          />
          <div className="doc-reg-toolbar-right">
            <ListPageSizeSelect pageSize={pageSize} onPageSizeChange={setPageSize} />
          </div>
        </div>

        <div className="doc-reg-table-wrap">
          {showSkeleton ? (
            <DocumentTableSkeleton rows={6} />
          ) : archives.length === 0 ? (
            <div className="doc-register-empty-state">
              <h3 className="doc-register-empty-title">Nenhum arquivo ainda</h3>
              <p className="doc-register-empty-text">
                Quando uma revisão substituir uma versão aprovada, a versão anterior aparecerá aqui.
              </p>
            </div>
          ) : filteredArchives.length === 0 ? (
            <div className="doc-register-empty-state">
              <h3 className="doc-register-empty-title">Nenhum resultado</h3>
              <p className="doc-register-empty-text">Tente outro termo de busca.</p>
            </div>
          ) : (
            <table className="doc-reg-table">
              <thead>
                <tr>
                  <th>Versão <SortIcon /></th>
                  <th>Substituída por <SortIcon /></th>
                  <th>Código <SortIcon /></th>
                  <th>Título <SortIcon /></th>
                  <th>Tipo <SortIcon /></th>
                  <th>Processo <SortIcon /></th>
                  <th>Arquivado em <SortIcon /></th>
                  <th className="doc-reg-col-actions">Ações</th>
                </tr>
              </thead>
              <tbody>
                {pagedArchives.map((row) => {
                  const prefix = TYPE_PREFIX[row.type];
                  const avatarLetter = prefix?.trim()
                    ? prefix.trim().charAt(0).toUpperCase()
                    : row.type?.charAt(0)?.toUpperCase() ?? '?';

                  return (
                    <tr key={row.id} className="doc-reg-row">
                      <td>
                        <span className="doc-reg-version">v{formatRevisionVersionLabel(row.version)}</span>
                      </td>
                      <td>
                        <span className="doc-reg-version">
                          v{formatRevisionVersionLabel(row.supersededByVersion)}
                        </span>
                      </td>
                      <td>
                        <span className="doc-reg-code">{row.code || '—'}</span>
                      </td>
                      <td>
                        <div className="doc-reg-title-cell">
                          <span
                            className={`doc-reg-type-avatar ${getRegisterTypeAvatarClass(row.type)}`}
                            aria-hidden
                            title={avatarLetter}
                          >
                            <DocumentTypeIcon type={row.type} />
                          </span>
                          <span className="doc-reg-title-text">{row.title}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`doc-type-badge ${documentTypeBadgeClass(row.type)}`}>{row.type}</span>
                      </td>
                      <td>{row.process || '—'}</td>
                      <td>{formatDate(row.archivedAt)}</td>
                      <td className="doc-reg-col-actions">
                        <div className="doc-reg-actions-cell">
                          {row.fileName ? (
                            <button
                              type="button"
                              className="doc-btn doc-btn-outline doc-btn-sm"
                              disabled={viewingArchiveId === row.id}
                              onClick={() => handleViewFile(row)}
                            >
                              Ver arquivo
                            </button>
                          ) : null}
                          {onOpenCurrentDocument ? (
                            <button
                              type="button"
                              className="doc-btn doc-btn-outline doc-btn-sm"
                              onClick={() => onOpenCurrentDocument(row.sourceDocumentId)}
                            >
                              Documento atual
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {filteredArchives.length > 0 ? (
          <ListPaginationFooter
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={setPage}
          />
        ) : null}
      </section>
    </div>
  );
}