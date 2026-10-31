import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, type DocumentRecord } from '../../../lib/api';
import { documentTypeBadgeClass } from '../../../data/documentRegister';
import { ListSearchBar } from '../../../components/common/ListSearchBar';
import { matchesTitleOrCode } from '../../../lib/search/documentSearch';
import { EmptyDraftsLottie } from './EmptyDraftsLottie';
import './MyDraftsView.css';
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

interface MyDraftsViewProps {
  onNewDocument?: () => void;
  onDocumentClick?: (documentId: string, options?: { edit?: boolean }) => void;
  refreshKey?: number;
}

export function MyDraftsView({ onNewDocument, onDocumentClick, refreshKey = 0 }: MyDraftsViewProps) {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const loadDrafts = useCallback(async () => {
    setError('');
    setIsLoading(true);
    try {
      const { documents: data } = await api.getMyDrafts();
      setDocuments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load drafts');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDrafts();
  }, [loadDrafts, refreshKey]);

  const filteredDocuments = useMemo(
    () => documents.filter((doc) => matchesTitleOrCode(searchQuery, doc)),
    [documents, searchQuery],
  );

  const total = filteredDocuments.length;

  return (
    <div className="my-drafts">
      {(error) && (
        <div className="doc-alert doc-alert-error">{error}</div>
      )}

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
              <h2 className="doc-card-title">My Drafts</h2>
              <p className="doc-card-subtitle">Documents you saved as draft and have not submitted yet</p>
            </div>
          </div>
          <div className="doc-card-actions">
            <button type="button" className="doc-btn doc-btn-primary" onClick={() => onNewDocument?.()}>
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

        <div className="doc-table-wrap">
          {isLoading ? (
            <div className="doc-table-loading">Loading your drafts...</div>
          ) : documents.length === 0 ? (
            <div className="my-drafts-empty-state">
              <EmptyDraftsLottie />
              <h3 className="my-drafts-empty-title">You have no draft documents yet</h3>
              <p className="my-drafts-empty-text">
                When you save a document as draft, it will appear here ready for you to continue editing.
              </p>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="my-drafts-empty-state">
              <h3 className="my-drafts-empty-title">No matching drafts</h3>
              <p className="my-drafts-empty-text">Try a different title or document code.</p>
            </div>
          ) : (
            <table className="doc-table">
              <thead>
                <tr>
                  <th>Document Code <SortIcon /></th>
                  <th>Document Title <SortIcon /></th>
                  <th>Version <SortIcon /></th>
                  <th>Document Type <SortIcon /></th>
                  <th>Process <SortIcon /></th>
                  <th>Owner <SortIcon /></th>
                  <th>Created <SortIcon /></th>
                  <th>Status <SortIcon /></th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map((doc) => (
                    <tr
                      key={doc.id}
                      className="doc-table-row-clickable"
                      onClick={() => onDocumentClick?.(doc.id, { edit: true })}
                    >
                      <td className="doc-code">{doc.code || '—'}</td>
                      <td>{doc.title}</td>
                      <td>{String(doc.version).padStart(2, '0')}</td>
                      <td>
                        <span className={`doc-badge ${documentTypeBadgeClass(doc.type)}`}>
                          {doc.type}
                        </span>
                      </td>
                      <td>{doc.process}</td>
                      <td>{doc.owner || '—'}</td>
                      <td className="doc-date-cell">{formatDate(doc.createdAt)}</td>
                      <td>
                        <span className="doc-badge badge-draft">Draft</span>
                      </td>
                      <td>
                        <div className="doc-row-actions" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            className="doc-action-btn"
                            title="View"
                            onClick={() => onDocumentClick?.(doc.id)}
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            className="doc-action-btn"
                            title="Edit draft"
                            onClick={() => onDocumentClick?.(doc.id, { edit: true })}
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                              <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>

        {!isLoading && total > 0 && (
          <div className="doc-table-footer">
            <span>{total} draft{total === 1 ? '' : 's'}</span>
          </div>
        )}
      </section>
    </div>
  );
}
