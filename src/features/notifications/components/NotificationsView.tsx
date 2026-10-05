import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, type DocumentRecord } from '../../../lib/api';
import { ListSearchBar } from '../../../components/common/ListSearchBar';
import { matchesTitleOrCode } from '../../../lib/search/documentSearch';
import {
  formatNotificationDate,
  getNotificationTypeLabel,
  toDashboardNotification,
  type DashboardNotification,
} from '../../../lib/notifications';
import { ConfirmDialog } from '../../../components/dialogs/ConfirmDialog';
import './NotificationsView.css';

interface NotificationsViewProps {
  refreshKey?: number;
  onNotificationClick?: (notification: DashboardNotification) => void;
  onNotificationsChange?: () => void;
}

function NotificationTypeIcon({ type }: { type?: DashboardNotification['type'] }) {
  if (type === 'document_approved') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M20 6 9 17l-5-5" />
      </svg>
    );
  }

  if (type === 'approval_request') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M12 8v4l3 3" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    );
  }

  if (type === 'document_rejected') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <circle cx="12" cy="12" r="9" />
        <path d="M15 9 9 15M9 9l6 6" />
      </svg>
    );
  }

  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </svg>
  );
}

export function NotificationsView({
  refreshKey = 0,
  onNotificationClick,
  onNotificationsChange,
}: NotificationsViewProps) {
  const [notifications, setNotifications] = useState<DashboardNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<DashboardNotification | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [documentsById, setDocumentsById] = useState<Map<string, DocumentRecord>>(new Map());

  const loadNotifications = useCallback(async () => {
    setError('');
    setIsLoading(true);
    try {
      const [{ notifications: data }, { documents }] = await Promise.all([
        api.getNotifications(),
        api.getDocuments(),
      ]);
      setNotifications(data.map(toDashboardNotification));
      setDocumentsById(new Map(documents.map((doc) => [doc.id, doc])));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications, refreshKey]);

  async function handleMarkAsRead(notification: DashboardNotification) {
    if (!notification.unread) return;

    setActionId(notification.id);
    try {
      await api.markNotificationRead(notification.id);
      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id ? { ...item, unread: false } : item,
        ),
      );
      onNotificationsChange?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark notification as read');
    } finally {
      setActionId(null);
    }
  }

  async function handleOpen(notification: DashboardNotification) {
    if (notification.unread) {
      await handleMarkAsRead(notification);
    }
    onNotificationClick?.(notification);
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;

    const notificationId = pendingDelete.id;
    setPendingDelete(null);
    setActionId(notificationId);

    try {
      await api.deleteNotification(notificationId);
      setNotifications((current) => current.filter((item) => item.id !== notificationId));
      onNotificationsChange?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete notification');
    } finally {
      setActionId(null);
    }
  }

  const filteredNotifications = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return notifications;

    return notifications.filter((notification) => {
      const linkedDoc = notification.documentId
        ? documentsById.get(notification.documentId)
        : undefined;

      if (
        linkedDoc &&
        matchesTitleOrCode(searchQuery, linkedDoc)
      ) {
        return true;
      }

      if (notification.title.toLowerCase().includes(query)) return true;
      if (notification.message.toLowerCase().includes(query)) return true;
      return false;
    });
  }, [notifications, searchQuery, documentsById]);

  const unreadCount = filteredNotifications.filter((item) => item.unread).length;
  const readCount = filteredNotifications.length - unreadCount;

  return (
    <div className="notifications-view">
      <div className="notifications-header">
        <div>
          <h1 className="notifications-page-title">Notifications</h1>
          <p className="notifications-page-subtitle">
            Stay on top of document approvals and updates
          </p>
        </div>
        <ListSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          className="notifications-search"
        />
        <div className="notifications-stats">
          <span className="notifications-stat">
            <strong>{filteredNotifications.length}</strong> shown
          </span>
          <span className="notifications-stat notifications-stat-unread">
            <strong>{unreadCount}</strong> unread
          </span>
          <span className="notifications-stat">
            <strong>{readCount}</strong> read
          </span>
        </div>
      </div>

      {error && <div className="notifications-alert">{error}</div>}

      {isLoading ? (
        <div className="notifications-panel notifications-empty-state">
          <p>Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="notifications-panel notifications-empty-state">
          <div className="notifications-empty-icon" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5" />
              <path d="M10 20a2 2 0 0 0 4 0" />
            </svg>
          </div>
          <h2>No notifications yet</h2>
          <p>When documents are submitted, approved, or not approved, updates will appear here.</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="notifications-panel notifications-empty-state">
          <h2>No matching notifications</h2>
          <p>Try a different document title or code.</p>
        </div>
      ) : (
        <ul className="notifications-panel notifications-list">
          {filteredNotifications.map((notification) => (
            <li
              key={notification.id}
              className={`notifications-card ${notification.unread ? 'unread' : 'read'} type-${notification.type ?? 'default'}`}
            >
              <div className={`notifications-card-icon ${notification.type ?? 'default'}`}>
                <NotificationTypeIcon type={notification.type} />
              </div>

              <div className="notifications-card-body">
                <div className="notifications-card-top">
                  <div className="notifications-card-meta">
                    <span className="notifications-type-label">
                      {getNotificationTypeLabel(notification.type)}
                    </span>
                    {notification.unread ? (
                      <span className="notifications-unread-dot" aria-label="Unread" />
                    ) : null}
                  </div>
                  <time className="notifications-card-time" dateTime={notification.createdAt}>
                    {notification.time}
                  </time>
                </div>

                <h3 className="notifications-card-title">{notification.title}</h3>
                <p className="notifications-card-message">{notification.message}</p>
                <p className="notifications-card-date">{formatNotificationDate(notification.createdAt)}</p>
              </div>

              <div className="notifications-card-actions">
                {notification.documentId ? (
                  <button
                    type="button"
                    className="notifications-action-btn notifications-action-primary"
                    onClick={() => handleOpen(notification)}
                    disabled={actionId === notification.id}
                  >
                    Open
                  </button>
                ) : null}
                {notification.unread ? (
                  <button
                    type="button"
                    className="notifications-action-btn"
                    disabled={actionId === notification.id}
                    onClick={() => handleMarkAsRead(notification)}
                  >
                    {actionId === notification.id ? 'Saving...' : 'Mark read'}
                  </button>
                ) : null}
                <button
                  type="button"
                  className="notifications-action-btn notifications-action-danger"
                  disabled={actionId === notification.id}
                  onClick={() => setPendingDelete(notification)}
                  aria-label={`Delete notification ${notification.title}`}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete notification"
        message={
          pendingDelete
            ? `Are you sure you want to delete "${pendingDelete.title}"? This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
