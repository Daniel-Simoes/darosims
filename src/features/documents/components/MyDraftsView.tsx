import * as S from './DocumentRegisterView.styles';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, type DocumentRecord } from '../../../lib/api';
import { documentTypeBadgeClass } from '../../../data/documentRegister';
import { ListSearchBar } from '../../../components/common/ListSearchBar';
import { matchesTitleOrCode } from '../../../lib/search/documentSearch';
import { EmptyDraftsLottie } from './EmptyDraftsLottie';

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
    <S.MyDrafts>
      {(error) && (
        <S.DocAlert>{error}</S.DocAlert>
      )}

      <S.DocCard>
        <S.DocCardHeader>
          <S.DocCardTitleGroup>
            <S.DocCardIcon>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6M12 11v6M9 14h6" />
              </svg>
            </S.DocCardIcon>
            <div>
              <S.DocCardTitle>My Drafts</S.DocCardTitle>
              <S.DocCardSubtitle>Documents you saved as draft and have not submitted yet</S.DocCardSubtitle>
            </div>
          </S.DocCardTitleGroup>
          <S.DocCardActions>
            <button type="button" className="doc-btn doc-btn-primary" onClick={() => onNewDocument?.()}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
              New Document
            </button>
          </S.DocCardActions>
        </S.DocCardHeader>

        <S.DocCardToolbar>
          <ListSearchBar value={searchQuery} onChange={setSearchQuery} />
        </S.DocCardToolbar>

        <S.DocTableWrap>
          {isLoading ? (
            <S.DocTableLoading>Loading your drafts...</S.DocTableLoading>
          ) : documents.length === 0 ? (
            <S.MyDraftsEmptyState>
              <EmptyDraftsLottie />
              <S.MyDraftsEmptyTitle>You have no draft documents yet</S.MyDraftsEmptyTitle>
              <S.MyDraftsEmptyText>
                When you save a document as draft, it will appear here ready for you to continue editing.
              </S.MyDraftsEmptyText>
            </S.MyDraftsEmptyState>
          ) : filteredDocuments.length === 0 ? (
            <S.MyDraftsEmptyState>
              <S.MyDraftsEmptyTitle>No matching drafts</S.MyDraftsEmptyTitle>
              <S.MyDraftsEmptyText>Try a different title or document code.</S.MyDraftsEmptyText>
            </S.MyDraftsEmptyState>
          ) : (
            <S.DocTable>
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
                    <S.DocTableRowClickable
                      key={doc.id}
                      onClick={() => onDocumentClick?.(doc.id, { edit: true })}
                    >
                      <S.DocCode as="td">{doc.code || '—'}</S.DocCode>
                      <td>{doc.title}</td>
                      <td>{String(doc.version).padStart(2, '0')}</td>
                      <td>
                        <S.DocBadge $variant={S.badgeVariantFromClass(documentTypeBadgeClass(doc.type))}>
                          {doc.type}
                        </S.DocBadge>
                      </td>
                      <td>{doc.process}</td>
                      <td>{doc.owner || '—'}</td>
                      <S.DocDateCell as="td">{formatDate(doc.createdAt)}</S.DocDateCell>
                      <td>
                        <S.DocBadge $variant="draft">Draft</S.DocBadge>
                      </td>
                      <td>
                        <S.DocRowActions onClick={(e) => e.stopPropagation()}>
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
                        </S.DocRowActions>
                      </td>
                    </S.DocTableRowClickable>
                  ))}
              </tbody>
            </S.DocTable>
          )}
        </S.DocTableWrap>

        {!isLoading && total > 0 && (
          <S.DocTableFooter>
            <span>{total} draft{total === 1 ? '' : 's'}</span>
          </S.DocTableFooter>
        )}
      </S.DocCard>
    </S.MyDrafts>
  );
}
