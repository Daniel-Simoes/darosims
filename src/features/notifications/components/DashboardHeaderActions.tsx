import {
  DhaCompanyLogo,
  DhaCompanyLogoFallback,
  DhaCompanyMenuName,
  DhaCompanyMenuSubtitle,
  DhaDropdown,
  DhaDropdownHead,
  DhaMenuWrap,
  DhaNotifBadge,
  DhaNotificationEmpty,
  DhaNotificationFooter,
  DhaNotificationList,
  DhaNotificationMessage,
  DhaNotificationTime,
  DhaNotificationTitle,
  DhaRoot,
  DhaUnreadPill,
  DhaUserAvatar,
  DhaUserLogoFallback,
  DhaUserMenuEmail,
  DhaUserMenuName,
} from './DashboardHeaderActions.styles';
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
    <DhaRoot>
      <DhaMenuWrap
        onMouseEnter={() => setActiveMenu('notifications')}
        onMouseLeave={() => setActiveMenu(null)}
      >
        <div
          className={`dha-icon-btn dha-notif-btn dha-menu-trigger ${activeMenu === 'notifications' ? 'active' : ''}`}
          aria-label="Notifications"
        >
          <BellIcon />
          {unreadCount > 0 && <DhaNotifBadge>{unreadCount}</DhaNotifBadge>}
        </div>
        {activeMenu === 'notifications' && (
          <DhaDropdown>
            <DhaDropdownHead>
              <span>Notifications</span>
              {unreadCount > 0 && <DhaUnreadPill>{unreadCount} new</DhaUnreadPill>}
            </DhaDropdownHead>
            <DhaNotificationList>
              {isLoadingNotifications ? (
                <DhaNotificationEmpty>Loading notifications...</DhaNotificationEmpty>
              ) : unreadNotifications.length === 0 ? (
                <DhaNotificationEmpty>No notifications</DhaNotificationEmpty>
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
                      <DhaNotificationTitle>{notification.title}</DhaNotificationTitle>
                      <DhaNotificationMessage>{notification.message}</DhaNotificationMessage>
                      <DhaNotificationTime>{notification.time}</DhaNotificationTime>
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
            </DhaNotificationList>
            <DhaNotificationFooter>
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
            </DhaNotificationFooter>
          </DhaDropdown>
        )}
      </DhaMenuWrap>

      <DhaMenuWrap
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
            <DhaCompanyLogoFallback>{companyLetter}</DhaCompanyLogoFallback>
          )}
        </div>
        {activeMenu === 'company' && (
          <DhaDropdown>
            <DhaDropdownHead>
              <DhaCompanyLogo>
                {companyLogoUrl ? (
                  <img src={companyLogoUrl} alt="" className="dha-company-logo-img" />
                ) : (
                  <DhaCompanyLogoFallback>{companyLetter}</DhaCompanyLogoFallback>
                )}
              </DhaCompanyLogo>
              <div>
                <DhaCompanyMenuName>{companyName}</DhaCompanyMenuName>
                <DhaCompanyMenuSubtitle>Organization</DhaCompanyMenuSubtitle>
              </div>
            </DhaDropdownHead>
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
          </DhaDropdown>
        )}
      </DhaMenuWrap>

      <DhaMenuWrap
        onMouseEnter={() => setActiveMenu('user')}
        onMouseLeave={() => setActiveMenu(null)}
      >
        <div
          className={`dha-user-logo-btn dha-menu-trigger ${activeMenu === 'user' ? 'active' : ''}`}
          aria-label={`${displayName} menu`}
        >
          <DhaUserLogoFallback>{avatarLetter}</DhaUserLogoFallback>
        </div>
        {activeMenu === 'user' && (
          <DhaDropdown>
            <DhaDropdownHead>
              <DhaUserAvatar>{avatarLetter}</DhaUserAvatar>
              <div>
                <DhaUserMenuName>{displayName}</DhaUserMenuName>
                <DhaUserMenuEmail>{user?.email}</DhaUserMenuEmail>
              </div>
            </DhaDropdownHead>
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
          </DhaDropdown>
        )}
      </DhaMenuWrap>

      <ConfirmDialog
        open={showLogoutConfirm}
        title="Confirm log off"
        message="Are you sure you want to log off?"
        confirmLabel="Yes"
        cancelLabel="Cancel"
        onConfirm={handleConfirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </DhaRoot>
  );
}
