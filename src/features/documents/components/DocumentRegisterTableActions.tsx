import { useEffect, useRef, useState } from 'react';
import type { DocumentRecord } from '../../../types/documents';
import type { AuthUser } from '../../../types/auth';
import {
  canUserArchiveDocument,
  canUserDeleteDocument,
  canUserEditDocument,
  canUserStartApprovedDocumentRevision,
} from '../../../lib/documentUsers';

interface DocumentRegisterTableActionsProps {
  doc: DocumentRecord;
  user: AuthUser | null;
  deletingId: string | null;
  archivingId: string | null;
  viewingPdfId: string | null;
  onView: () => void;
  onChat: () => void;
  onEdit: () => void;
  onBeginRevision: () => void;
  onHistory: () => void;
  onOpenFile: () => void;
  onDelete: () => void;
  onArchive: () => void;
}

export function DocumentRegisterTableActions({
  doc,
  user,
  deletingId,
  archivingId,
  viewingPdfId,
  onView,
  onChat,
  onEdit,
  onBeginRevision,
  onHistory,
  onOpenFile,
  onDelete,
  onArchive,
}: DocumentRegisterTableActionsProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const canEdit = canUserEditDocument(user, doc);
  const canRevision = canUserStartApprovedDocumentRevision(user, doc);
  const canDelete = canUserDeleteDocument(user, doc);
  const canArchive = canUserArchiveDocument(user, doc);

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
      <button type="button" className="doc-reg-round-btn" title="Open document" onClick={onView}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>
      <button type="button" className="doc-reg-round-btn" title="Comments" onClick={onChat}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>
      {canEdit ? (
        <button type="button" className="doc-reg-round-btn doc-reg-round-btn-primary" title="Edit" onClick={onEdit}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z" />
          </svg>
        </button>
      ) : canRevision ? (
        <button
          type="button"
          className="doc-reg-round-btn doc-reg-round-btn-primary"
          title="Start new version"
          onClick={onBeginRevision}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      ) : (
        <button type="button" className="doc-reg-round-btn" title="View only" disabled>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z" />
          </svg>
        </button>
      )}

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
            <button type="button" role="menuitem" onClick={() => { setMenuOpen(false); onHistory(); }}>
              Review history
            </button>
            <button
              type="button"
              role="menuitem"
              disabled={!doc.fileName || viewingPdfId === doc.id}
              onClick={() => { setMenuOpen(false); onOpenFile(); }}
            >
              Open file
            </button>
            {canRevision && !canEdit ? (
              <button type="button" role="menuitem" onClick={() => { setMenuOpen(false); onBeginRevision(); }}>
                New version
              </button>
            ) : null}
            {canArchive ? (
              <button
                type="button"
                role="menuitem"
                disabled={archivingId === doc.id}
                onClick={() => {
                  setMenuOpen(false);
                  onArchive();
                }}
              >
                Archive
              </button>
            ) : null}
            {canDelete ? (
              <button
                type="button"
                role="menuitem"
                className="danger"
                disabled={deletingId === doc.id}
                onClick={() => { setMenuOpen(false); onDelete(); }}
              >
                Delete
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}