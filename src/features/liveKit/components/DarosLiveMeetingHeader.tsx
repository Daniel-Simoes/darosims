import type { ReactNode } from 'react';
import type { DocumentRecord } from '../../../types/documents';
import { useMeetingDurationFromFirstJoin } from '../hooks/useMeetingDurationFromFirstJoin';

interface DarosLiveMeetingHeaderProps {
  document: DocumentRecord | null;
  connectionState: string;
  onToggleFullscreen: () => void;
  workflowSlot?: ReactNode;
  /** Document author is presenting the document in the live session. */
  isHost?: boolean;
}

function formatDocumentCreated(iso: string | undefined): string {
  if (!iso?.trim()) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function DarosLiveMeetingHeader({
  document,
  connectionState,
  onToggleFullscreen,
  workflowSlot,
  isHost = false,
}: DarosLiveMeetingHeaderProps) {
  const duration = useMeetingDurationFromFirstJoin();
  const live = connectionState === 'Connected';
  const title = document?.title?.trim() || 'Document';
  const code = document?.code?.trim();
  const createdLabel = formatDocumentCreated(document?.createdAt);

  return (
    <header className="dl-meeting-header">
      <div className="dl-meeting-brand">
        <span className="dl-meeting-brand-mark dl-meeting-brand-logo" aria-hidden="true">
          <img src="/daros-logo.png" alt="" width={36} height={36} />
        </span>
        <div className="dl-meeting-header-doc">
          <p className="dl-meeting-brand-title">{title}</p>
          <p className="dl-meeting-brand-sub">
            {code ? <span className="dl-meeting-doc-code">{code}</span> : null}
            {code && createdLabel ? <span className="dl-meeting-doc-sep"> · </span> : null}
            {createdLabel ? <span className="dl-meeting-doc-created">Created {createdLabel}</span> : null}
          </p>
        </div>
      </div>

      <div className="dl-meeting-header-center" aria-live="polite">
        {isHost ? (
          <span className="dl-presenting-badge-header">
            <span className="dl-presenting-rec-dot" aria-hidden="true" />
            You are the host
          </span>
        ) : null}
      </div>

      <div className="dl-meeting-header-status" aria-live="polite">
        {workflowSlot}
        <span className={`dl-live-indicator dl-live-indicator-round${live ? ' dl-live-indicator-on' : ''}`}>
          <span className="dl-live-indicator-dot" aria-hidden="true" />
          {duration}
        </span>
        <button
          type="button"
          className="dl-header-icon-btn dl-header-icon-btn-round"
          onClick={onToggleFullscreen}
          aria-label="Toggle full screen"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3" />
          </svg>
        </button>
      </div>
    </header>
  );
}