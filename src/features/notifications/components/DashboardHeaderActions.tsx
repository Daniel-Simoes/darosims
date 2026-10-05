import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../lib/api';
import {
  toDashboardNotification,
  type DashboardNotification,
} from '../../../lib/notifications';
import { useAuth } from '../../../context/AuthContext';
import { waitForEntryLoading } from '../../../lib/entryLoading';
import { ConfirmDialog } from '../../../components/dialogs/ConfirmDialog';
import { appConfig } from '../../../config/app';
import companyLogo from '../../../assets/daros-logo-icon.png';
import './DashboardHeaderActions.css';

export type { DashboardNotification };

const COMPANY_MENU_ITEMS = [
  { id: 'company-profile', label: 'Company Profile' },
  { id: 'organization', label: 'Organization Settings' },
  { id: 'company-users', label: 'Manage Users' },
];

const SETTINGS_ITEMS = [
  { id: 'profile', label: 'Profile Settings' },
  { id: 'notifications', label: 'Notification Preferences' },
  { id: 'system', label: 'System Settings' },
];

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </svg>
  );
}

interface DashboardHeaderActionsProps {
  refreshKey?: number;
  onNotificationClick?: (notification: DashboardNotification) => void;
  onViewAllNotifications?: () => void;
  onNotificationsChange?: () => void;
  onSettingsClick?: (settingId: string) => void;
  onCompanyMenuClick?: (menuId: string) => void;
}

export function DashboardHeaderActions({
  refreshKey = 0,
  onNotificationClick,
  onViewAllNotifications,
  onNotificationsChange,
  onSettingsClick,
  onCompanyMenuClick,
}: DashboardHeaderActionsProps) {
  const { user, logout, beginEntryLoading } = useAuth();
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState<'notifications' | 'company' | 'user' | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [notifications, setNotifications] = useState<DashboardNotification[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);
  const [markingId, setMarkingId] = useState<string | null>(null);

  const displayName = user?.name ?? 'User';
  const avatarLetter = displayName.charAt(0).toUpperCase();
  const companyName = appConfig.company.name;
  const companyLogoUrl = appConfig.company.logoUrl ?? companyLogo;
  const companyLetter = companyName.charAt(0).toUpperCase();
  const unreadNotifications = notifications.filter((item) => item.unread);
  const unreadCount = unreadNotifications.length;

  const loadNotifications = useCallback(async () => {
    setIsLoadingNotifications(true);
    try {
      const { notifications: data } = await api.getNotifications();
      setNotifications(data.map(toDashboardNotification));
    } catch {
      setNotifications([]);
    } finally {
      setIsLoadingNotifications(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications, refreshKey]);

  function handleLogoutClick() {
    setActiveMenu(null);
    setShowLogoutConfirm(true);
  }

  async function handleConfirmLogout() {
    setShowLogoutConfirm(false);
    setIsLoggingOut(true);
    beginEntryLoading();

    const startedAt = Date.now();
    await waitForEntryLoading(startedAt);

    logout();
    navigate('/signin');
    setIsLoggingOut(false);
  }

  function handleChangeUser() {
    setActiveMenu(null);
    logout();
    navigate('/signin', { state: { switchUser: true } });
  }

  async function handleMarkAsRead(
    event: React.MouseEvent,
    notification: DashboardNotification,
  ) {
    event.stopPropagation();
    if (!notification.unread) return;

    setMarkingId(notification.id);
    try {
      await api.markNotificationRead(notification.id);
      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id ? { ...item, unread: false } : item,
        ),
      );
      onNotificationsChange?.();
    } catch {
      // Keep UI unchanged if the request fails.
    } finally {
      setMarkingId(null);
    }
  }

  async function handleNotificationOpen(notification: DashboardNotification) {
    if (notification.unread) {
      try {
        await api.markNotificationRead(notification.id);
        setNotifications((current) =>
          current.map((item) =>
            item.id === notification.id ? { ...item, unread: false } : item,
          ),
        );
        onNotificationsChange?.();
      } catch {
        // Continue navigation even if marking read fails.
      }
    }

    setActiveMenu(null);
    onNotificationClick?.(notification);
  }

  function handleSettingsClick(settingId: string) {
    setActiveMenu(null);
    onSettingsClick?.(settingId);
  }

  function handleCompanyMenuClick(menuId: string) {
    setActiveMenu(null);
    onCompanyMenuClick?.(menuId);
  }

  return (
    <div className="dha-root">
      <div
        className="dha-menu-wrap dha-menu-wrap-notifications"
        onMouseEnter={() => setActiveMenu('notifications')}
        onMouseLeave={() => setActiveMenu(null)}
      >
        <div
          className={`dha-icon-btn dha-notif-btn dha-menu-trigger ${activeMenu === 'notifications' ? 'active' : ''}`}
          aria-label="Notifications"
        >
          <BellIcon />
          {unreadCount > 0 && <span className="dha-notif-badge">{unreadCount}</span>}
        </div>
        {activeMenu === 'notifications' && (
          <div className="dha-dropdown dha-dropdown-notifications">
            <div className="dha-dropdown-head">
              <span>Notifications</span>
              {unreadCount > 0 && <span className="dha-unread-pill">{unreadCount} new</span>}
            </div>
            <div className="dha-notification-list">
              {isLoadingNotifications ? (
                <div className="dha-notification-empty">Loading notifications...</div>
              ) : unreadNotifications.length === 0 ? (
                <div className="dha-notification-empty">No notifications</div>
              ) : (
                unreadNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`dha-notification-item ${notification.unread ? 'unread' : ''}`}
                  >
                    <button
                      type="button"
                      className="dha-notification-item-body"
                      onClick={() => handleNotificationOpen(notification)}
                    >
                      <div className="dha-notification-title">{notification.title}</div>
                      <div className="dha-notification-message">{notification.message}</div>
                      <div className="dha-notification-time">{notification.time}</div>
                    </button>
                    <button
                      type="button"
                      className="dha-notification-mark-read"
                      disabled={markingId === notification.id}
                      onClick={(event) => handleMarkAsRead(event, notification)}
                    >
                      {markingId === notification.id ? 'Saving...' : 'Mark read'}
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className="dha-notification-footer">
              <button
                type="button"
                className="dha-notification-view-all"
                onClick={() => {
                  setActiveMenu(null);
                  onViewAllNotifications?.();
                }}
              >
                View all notifications
              </button>
            </div>
          </div>
        )}
      </div>

      <div
        className="dha-menu-wrap dha-menu-wrap-company"
        onMouseEnter={() => setActiveMenu('company')}
        onMouseLeave={() => setActiveMenu(null)}
      >
        <div
          className={`dha-company-logo-btn dha-menu-trigger ${activeMenu === 'company' ? 'active' : ''}`}
          aria-label={`${companyName} menu`}
        >
          {companyLogoUrl ? (
            <img
              src={companyLogoUrl}
              alt={companyName}
              className="dha-company-logo-img"
            />
          ) : (
            <span className="dha-company-logo-fallback">{companyLetter}</span>
          )}
        </div>
        {activeMenu === 'company' && (
          <div className="dha-dropdown dha-dropdown-company">
            <div className="dha-dropdown-head dha-company-head">
              <span className="dha-company-logo dha-company-logo-sm">
                {companyLogoUrl ? (
                  <img src={companyLogoUrl} alt="" className="dha-company-logo-img" />
                ) : (
                  <span className="dha-company-logo-fallback">{companyLetter}</span>
                )}
              </span>
              <div>
                <div className="dha-company-menu-name">{companyName}</div>
                <div className="dha-company-menu-subtitle">Organization</div>
              </div>
            </div>
            {COMPANY_MENU_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                className="dha-dropdown-item"
                onClick={() => handleCompanyMenuClick(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div
        className="dha-menu-wrap dha-menu-wrap-user"
        onMouseEnter={() => setActiveMenu('user')}
        onMouseLeave={() => setActiveMenu(null)}
      >
        <div
          className={`dha-user-logo-btn dha-menu-trigger ${activeMenu === 'user' ? 'active' : ''}`}
          aria-label={`${displayName} menu`}
        >
          <span className="dha-user-logo-fallback">{avatarLetter}</span>
        </div>
        {activeMenu === 'user' && (
          <div className="dha-dropdown dha-dropdown-user">
            <div className="dha-dropdown-head dha-user-head">
              <span className="dha-user-avatar">{avatarLetter}</span>
              <div>
                <div className="dha-user-menu-name">{displayName}</div>
                <div className="dha-user-menu-email">{user?.email}</div>
              </div>
            </div>
            {SETTINGS_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                className="dha-dropdown-item"
                onClick={() => handleSettingsClick(item.id)}
              >
                {item.label}
              </button>
            ))}
            <div className="dha-dropdown-divider" role="separator" />
            <button type="button" className="dha-dropdown-item" onClick={handleChangeUser}>
              Change User
            </button>
            <button
              type="button"
              className="dha-dropdown-item danger"
              onClick={handleLogoutClick}
              disabled={isLoggingOut}
            >
              Log Off
            </button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={showLogoutConfirm}
        title="Confirm log off"
        message="Are you sure you want to log off?"
        confirmLabel="Yes"
        cancelLabel="Cancel"
        onConfirm={handleConfirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </div>
  );
}
