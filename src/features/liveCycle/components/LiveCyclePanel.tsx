import { useState } from 'react';
import { createPortal } from 'react-dom';
import { LiveKitMeetingTestJoin } from '../../liveKit';
import '../liveCycle.css';

interface LiveCyclePanelProps {
  open: boolean;
  onClose: () => void;
}

export function LiveCyclePanel({ open, onClose }: LiveCyclePanelProps) {
  const [tab, setTab] = useState<'overview' | 'livekit-test'>('overview');

  if (!open) return null;

  return createPortal(
    <div className="live-cycle-overlay" onClick={onClose} role="presentation">
      <div
        className="live-cycle-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="live-cycle-panel-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="live-cycle-panel-head">
          <div>
            <h2 id="live-cycle-panel-title" className="live-cycle-panel-title">
              Live Cycle
            </h2>
            <p className="live-cycle-panel-subtitle">
              Document lifecycle settings for this new document. Upcoming steps will appear here.
            </p>
          </div>
          <button
            type="button"
            className="live-cycle-panel-close"
            aria-label="Close Live Cycle"
            onClick={onClose}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </header>
        <div className="live-cycle-panel-tabs" role="tablist" aria-label="Live Cycle sections">
          <button
            type="button"
            role="tab"
            className={`live-cycle-tab${tab === 'overview' ? ' is-active' : ''}`}
            aria-selected={tab === 'overview'}
            onClick={() => setTab('overview')}
          >
            Overview
          </button>
          <button
            type="button"
            role="tab"
            className={`live-cycle-tab${tab === 'livekit-test' ? ' is-active' : ''}`}
            aria-selected={tab === 'livekit-test'}
            onClick={() => setTab('livekit-test')}
          >
            Live meeting test
          </button>
        </div>
        <div className="live-cycle-panel-body">
          {tab === 'overview' ? (
            <p className="live-cycle-panel-placeholder">
              Daros Live uses LiveKit for author, reviewer, and approver sessions. Approval decisions
              still use the standard workflow until the next integration phase.
            </p>
          ) : (
            <LiveKitMeetingTestJoin />
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}