import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, type DocumentTimeline } from '../../../lib/api';
import {
  getDocumentEventDescription,
  getDocumentEventLabel,
  getDocumentEventTone,
} from '../../../lib/documentEvents';
import { formatNotificationDate } from '../../../lib/notifications';
import { ListSearchBar } from '../../../components/common/ListSearchBar';
import './NotificationHistoryView.css';

interface NotificationHistoryViewProps {
  refreshKey?: number;
  filterDocumentId?: string;
  onDocumentClick?: (documentId: string) => void;
}

function TimelineEventIcon({ type }: { type: DocumentTimeline['events'][number]['type'] }) {
  const tone = getDocumentEventTone(type);

  if (tone === 'approved') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 6 9 17l-5-5" />
      </svg>
    );
  }

  if (tone === 'rejected') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="9" />
        <path d="M15 9 9 15M9 9l6 6" />
      </svg>
    );
  }

  if (tone === 'submitted') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 8v4l3 3" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    );
  }

  if (tone === 'edited') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
      </svg>
    );
  }

  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}

export function NotificationHistoryView({
  refreshKey = 0,
  filterDocumentId,
  onDocumentClick,
}: NotificationHistoryViewProps) {
  const [timelines, setTimelines] = useState<DocumentTimeline[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const loadHistory = useCallback(async () => {
    setError('');
    setIsLoading(true);
    try {
      const { timelines: data } = await api.getDocumentEvents(filterDocumentId);
      setTimelines(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notification history');
    } finally {
      setIsLoading(false);
    }
  }, [filterDocumentId]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory, refreshKey]);

  const filteredTimelines = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return timelines;
    return timelines.filter(
      (timeline) =>
        timeline.documentTitle.toLowerCase().includes(query) ||
        timeline.documentCode.toLowerCase().includes(query),
    );
  }, [search, timelines]);

  return (
    <div className="notification-history-view">
      <div className="notification-history-header">
        <div>
          <h1 className="notification-history-title">Notification History</h1>
          <p className="notification-history-subtitle">
            Document lifecycle map from creation through approval
          </p>
        </div>
        <ListSearchBar
          value={search}
          onChange={setSearch}
          className="notification-history-search"
        />
      </div>

      {error ? <div className="notification-history-alert">{error}</div> : null}

      {isLoading ? (
        <div className="notification-history-panel notification-history-empty">
          <p>Loading history...</p>
        </div>
      ) : filteredTimelines.length === 0 ? (
        <div className="notification-history-panel notification-history-empty">
          <h2>{search.trim() ? 'No matching history' : 'No history yet'}</h2>
          <p>
            {search.trim()
              ? 'Try a different document title or code.'
              : 'When documents are created, reviewed, edited, and approved, the timeline will appear here.'}
          </p>
        </div>
      ) : (
        <div className="notification-history-list">
          {filteredTimelines.map((timeline) => (
            <section key={timeline.documentId} className="notification-history-card">
              <div className="notification-history-card-header">
                <div>
                  <h2 className="notification-history-doc-title">{timeline.documentTitle}</h2>
                  <p className="notification-history-doc-meta">
                    {timeline.documentCode ? `${timeline.documentCode} · ` : ''}
                    {timeline.documentStatus}
                  </p>
                </div>
                {onDocumentClick ? (
                  <button
                    type="button"
                    className="notification-history-open-btn"
                    onClick={() => onDocumentClick(timeline.documentId)}
                  >
                    Open document
                  </button>
                ) : null}
              </div>

              <ol className="notification-history-timeline">
                {timeline.events.map((event, index) => {
                  const tone = getDocumentEventTone(event.type);
                  const isLast = index === timeline.events.length - 1;

                  return (
                    <li key={event.id} className={`notification-history-step tone-${tone}`}>
                      <div className="notification-history-step-track">
                        <span className={`notification-history-step-dot tone-${tone}`}>
                          <TimelineEventIcon type={event.type} />
                        </span>
                        {!isLast ? <span className="notification-history-step-line" aria-hidden="true" /> : null}
                      </div>

                      <div className="notification-history-step-body">
                        <div className="notification-history-step-top">
                          <span className={`notification-history-step-label tone-${tone}`}>
                            {getDocumentEventLabel(event.type)}
                          </span>
                          <time dateTime={event.createdAt}>{formatNotificationDate(event.createdAt)}</time>
                        </div>
                        <p className="notification-history-step-text">
                          {getDocumentEventDescription(event)}
                        </p>
                        {event.type === 'rejected' && event.metadata?.reason ? (
                          <div className="notification-history-reason-box">
                            <span>Reason</span>
                            <p>{event.metadata.reason}</p>
                          </div>
                        ) : null}
                        {event.type === 'edited' && event.metadata?.fileName ? (
                          <div className="notification-history-action-chip">
                            File: {event.metadata.fileName}
                          </div>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
