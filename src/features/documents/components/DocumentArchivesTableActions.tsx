import { useEffect, useRef, useState } from 'react';
import type { DocumentArchiveRecord } from '../../../types/documentArchive';

interface DocumentArchivesTableActionsProps {
  row: DocumentArchiveRecord;
  viewingArchiveId: string | null;
  canDelete?: boolean;
  deleting?: boolean;
  onOpenCurrentDocument?: () => void;
  onOpenArchiveFile: () => void;
  onDelete?: () => void;
}

export function DocumentArchivesTableActions({
  row,
  viewingArchiveId,
  canDelete = false,
  deleting = false,
  onOpenCurrentDocument,
  onOpenArchiveFile,
  onDelete,
}: DocumentArchivesTableActionsProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    window.addEventListener('mousedown', handlePointerDown);
    return () => window.removeEventListener('mousedown', handlePointerDown);
  }, [menuOpen]);

  return (
    <div className="doc-reg-action-row" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        className="doc-reg-round-btn"
        title="Current document"
        disabled={!onOpenCurrentDocument}
        onClick={onOpenCurrentDocument}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>
      <button
        type="button"
        className="doc-reg-round-btn doc-reg-round-btn-primary"
        title="Open archived file"
        disabled={!row.fileName || viewingArchiveId === row.id}
        onClick={onOpenArchiveFile}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
        </svg>
      </button>

      <div className="doc-reg-more-wrap" ref={menuRef}>
        <button
          type="button"
          className="doc-reg-round-btn"
          title="More actions"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="5" cy="12" r="1.75" />
            <circle cx="12" cy="12" r="1.75" />
            <circle cx="19" cy="12" r="1.75" />
          </svg>
        </button>
        {menuOpen ? (
          <div className="doc-reg-more-menu" role="menu">
            {onOpenCurrentDocument ? (
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  onOpenCurrentDocument();
                }}
              >
                Current document
              </button>
            ) : null}
            <button
              type="button"
              role="menuitem"
              disabled={!row.fileName || viewingArchiveId === row.id}
              onClick={() => {
                setMenuOpen(false);
                onOpenArchiveFile();
              }}
            >
              Open archived file
            </button>
            {canDelete && onDelete ? (
              <button
                type="button"
                role="menuitem"
                className="danger"
                disabled={deleting}
                onClick={() => {
                  setMenuOpen(false);
                  onDelete();
                }}
              >
                Delete archived version
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}