import { useEffect, useId, useRef, useState } from 'react';
import type { DocumentRecord } from '../../../types/documents';
import { AnchoredPopover } from '../../../components/common/AnchoredPopover';

function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

function resolveCreatorLabel(
  createdBy: string | undefined,
  teamUsers: { name: string; email: string }[],
): string {
  const raw = createdBy?.trim();
  if (!raw) return 'Unknown';
  const ref = raw.toLowerCase();
  const match = teamUsers.find(
    (user) =>
      user.email.trim().toLowerCase() === ref || user.name.trim().toLowerCase() === ref,
  );
  return match?.name ?? raw;
}

function formatCreatedDateTime(createdAt?: string): string {
  if (!createdAt?.trim()) return 'date unavailable';
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return 'date unavailable';
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function DocumentCreatedInfoButton({
  record,
  teamUsers,
}: {
  record: Pick<DocumentRecord, 'createdAt' | 'createdBy'>;
  teamUsers: { name: string; email: string }[];
}) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const anchorRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const creator = resolveCreatorLabel(record.createdBy, teamUsers);
  const createdWhen = formatCreatedDateTime(record.createdAt);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (anchorRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    globalThis.document.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      globalThis.document.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div className="doc-reg-created-wrap">
      <button
        ref={anchorRef}
        type="button"
        className="doc-reg-avatar doc-reg-avatar-created"
        onClick={(event) => {
          event.stopPropagation();
          setOpen((value) => !value);
        }}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="View document creation details"
      >
        <CalendarIcon />
      </button>
      <AnchoredPopover
        open={open}
        anchorRef={anchorRef}
        panelRef={panelRef}
        minWidth={280}
        maxWidth={320}
        estimatedHeight={100}
        className="doc-reg-created-popover"
      >
        <div role="dialog" aria-labelledby={titleId}>
          <p id={titleId} className="doc-reg-created-popover-title">
            Document created
          </p>
          <p className="doc-reg-created-popover-body">
            This document was created by <strong>{creator}</strong> on {createdWhen}.
          </p>
        </div>
      </AnchoredPopover>
    </div>
  );
}