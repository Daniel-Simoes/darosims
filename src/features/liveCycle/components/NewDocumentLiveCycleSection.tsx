import { useState } from 'react';
import { LiveCyclePanel } from './LiveCyclePanel';
import '../liveCycle.css';

interface NewDocumentLiveCycleSectionProps {
  disabled?: boolean;
}

function LiveCycleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M21 21v-5h-5" />
    </svg>
  );
}

/** Entry point for Live Cycle on the New Document form — isolated from existing workflow fields. */
export function NewDocumentLiveCycleSection({ disabled = false }: NewDocumentLiveCycleSectionProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="live-cycle-section">
      <button
        type="button"
        className="live-cycle-open-btn"
        disabled={disabled}
        onClick={() => setOpen(true)}
      >
        <LiveCycleIcon />
        Live Cycle
      </button>
      <LiveCyclePanel open={open} onClose={() => setOpen(false)} />
    </div>
  );
}