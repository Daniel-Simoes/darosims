import { useState, useEffect } from 'react';
import {
  dashboardModules,
  dashboardStats,
  isoStandards,
} from '../../data/dashboardModules';
import { documentViews, documentPageTitles } from '../../data/sidebarNav';
import {
  getModuleViewId,
  parseModuleViewId,
} from '../../data/moduleVisualizations';
import {
  getDocumentDetailViewId,
  parseDocumentDetailViewId,
} from '../../data/documentNavigation';
import { DashboardHeaderActions } from '../../features/notifications/components/DashboardHeaderActions';
import type { DashboardNotification } from '../../lib/notifications';
import { DashboardSidebar } from '../../features/dashboard/components/DashboardSidebar';
import { DocumentRegisterView } from '../../features/documents/components/DocumentRegisterView';
import { DocumentDetailView } from '../../features/documents/components/DocumentDetailView';
import { NewDocumentView } from '../../features/documents/components/NewDocumentView';
import { MyDraftsView } from '../../features/documents/components/MyDraftsView';
import { NotificationsView } from '../../features/notifications/components/NotificationsView';
import { NotificationHistoryView } from '../../features/notifications/components/NotificationHistoryView';
import { HomeCharts } from '../../features/dashboard/components/HomeCharts';
import { ModuleCarousel } from '../../features/dashboard/components/ModuleCarousel';
import { ModuleVisualizationView } from '../../features/dashboard/components/ModuleVisualizationView';
import { useAuth } from '../../features/authentication/context/AuthContext';
import { ProfileSettingsView } from '../../features/users/components/ProfileSettingsView';
import './DashboardPage.css';

function DashboardOverview({ onModuleClick }: { onModuleClick: (moduleId: string) => void }) {
  return (
    <>
      <ModuleCarousel modules={dashboardModules} onModuleClick={onModuleClick} />

      <div className="stats-grid">
        {dashboardStats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="stat-label">{stat.label}</div>
            <div className="stat-value">{stat.value}</div>
            {stat.change && (
              <div className={`stat-change ${stat.trend ?? ''}`}>{stat.change}</div>
            )}
          </div>
        ))}
      </div>

      <HomeCharts />

      <div className="iso-section">
        <h2 className="iso-section-title">ISO Compliance Progress</h2>
        <div className="iso-list">
          {isoStandards.map((iso) => (
            <div key={iso.id} className="iso-item">
              <div className="iso-item-info">
                <div className="iso-item-name">{iso.name}</div>
                <div className="iso-item-label">{iso.label}</div>
              </div>
              <div className="iso-progress-bar">
                <div
                  className="iso-progress-fill"
                  style={{ width: `${iso.progress}%` }}
                />
              </div>
              <span
                className={`iso-item-status ${
                  iso.status === 'In Progress'
                    ? 'in-progress'
                    : iso.status === 'Planned'
                      ? 'planned'
                      : 'future'
                }`}
              >
                {iso.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export function DashboardPage() {
  const { endEntryLoading } = useAuth();
  const [activeNav, setActiveNav] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [documentDetailEdit, setDocumentDetailEdit] = useState(false);
  const [documentReturnNav, setDocumentReturnNav] = useState('documents');
  const [draftsRefreshKey, setDraftsRefreshKey] = useState(0);
  const [notificationsRefreshKey, setNotificationsRefreshKey] = useState(0);
  const [historyFilterDocumentId, setHistoryFilterDocumentId] = useState<string | undefined>();
  const [profileReturnNav, setProfileReturnNav] = useState('dashboard');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      endEntryLoading();
    }, 150);
    return () => window.clearTimeout(timer);
  }, [endEntryLoading]);

  const isHome = activeNav === 'dashboard';
  const isNewDocument = activeNav === 'document-register';
  const isMyDrafts = activeNav === 'my-drafts';
  const isNotifications = activeNav === 'notifications';
  const isNotificationHistory = activeNav === 'notification-history';
  const isProfileSettings = activeNav === 'profile-settings';
  const documentDetailId = parseDocumentDetailViewId(activeNav);
  const isDocumentDetail = documentDetailId !== null;
  const isDocumentView = documentViews.includes(activeNav);
  const moduleId = parseModuleViewId(activeNav);
  const isModuleView = moduleId !== null;
  const activeModule = dashboardModules.find((m) => m.id === moduleId);
  const sidebarActiveNav = isDocumentDetail ? documentReturnNav : activeNav;

  const pageTitle = isDocumentDetail
    ? 'Document Details'
    : isProfileSettings
      ? 'Profile Settings'
      : isDocumentView || isNotifications || isNotificationHistory
      ? (documentPageTitles[activeNav] ?? 'Documents')
      : isModuleView && activeModule
        ? activeModule.title
        : isHome
          ? 'Home'
          : 'Dashboard Overview';

  const documentMode = activeNav === 'document-register' ? 'new' : 'register';
  const isSidebarExpanded = sidebarOpen || sidebarHovered;
  const isSidebarCollapsed = !isSidebarExpanded;

  function openDocument(id: string, options?: { edit?: boolean }, returnNav = activeNav) {
    setDocumentReturnNav(returnNav);
    setDocumentDetailEdit(Boolean(options?.edit));
    setActiveNav(getDocumentDetailViewId(id));
  }

  function handleSidebarHoverChange(hovered: boolean) {
    setSidebarHovered(hovered);
  }

  function handleModuleClick(moduleId: string) {
    setActiveNav(getModuleViewId(moduleId));
  }

  function bumpNotificationsRefresh() {
    setNotificationsRefreshKey((key) => key + 1);
  }

  function handleNavChange(id: string) {
    if (id === 'notification-history') {
      setHistoryFilterDocumentId(undefined);
    }
    setActiveNav(id);
  }

  function openHistory(documentId?: string) {
    setHistoryFilterDocumentId(documentId);
    setActiveNav('notification-history');
  }

  function handleSettingsClick(settingId: string) {
    if (settingId === 'profile') {
      setProfileReturnNav(activeNav);
      setActiveNav('profile-settings');
    }
  }

  function handleNotificationClick(
    notification: DashboardNotification,
    returnNav: string = 'documents',
  ) {
    if (notification.documentId) {
      openDocument(notification.documentId, undefined, returnNav);
    } else if (returnNav !== 'documents') {
      setActiveNav(returnNav);
    } else {
      setActiveNav('documents');
    }
    bumpNotificationsRefresh();
  }

  return (
    <div
      className={`dashboard-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}
    >
      <DashboardSidebar
        activeNav={sidebarActiveNav}
        onNavChange={handleNavChange}
        isOpen={sidebarOpen}
        isCollapsed={isSidebarCollapsed}
        onClose={() => setSidebarOpen(false)}
        onHoverChange={handleSidebarHoverChange}
      />

      <div className="dashboard-main">
        {!isDocumentDetail && (
        <header className="dashboard-header">
          <div className="dashboard-header-left">
            <button
              type="button"
              className="dashboard-menu-btn"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="dashboard-header-title">{pageTitle}</h1>
          </div>

          <div className="dashboard-header-actions">
            <DashboardHeaderActions
              refreshKey={notificationsRefreshKey}
              onNotificationClick={(notification) => handleNotificationClick(notification)}
              onViewAllNotifications={() => setActiveNav('notifications')}
              onNotificationsChange={bumpNotificationsRefresh}
              onSettingsClick={handleSettingsClick}
            />
          </div>
        </header>
        )}

        <main className={`dashboard-content ${isDocumentView || isDocumentDetail || isNotifications || isNotificationHistory || isProfileSettings ? 'dashboard-content-full' : ''}`}>
          {isProfileSettings ? (
            <ProfileSettingsView onBack={() => setActiveNav(profileReturnNav)} />
          ) : isNewDocument ? (
            <NewDocumentView
              onSavedAsDraft={() => {
                setDraftsRefreshKey((key) => key + 1);
                setActiveNav('my-drafts');
              }}
              onSubmittedForApproval={() => {
                setNotificationsRefreshKey((key) => key + 1);
                setActiveNav('documents');
              }}
            />
          ) : isDocumentDetail && documentDetailId ? (
            <DocumentDetailView
              documentId={documentDetailId}
              initialEdit={documentDetailEdit}
              onBack={() => {
                setDocumentDetailEdit(false);
                setActiveNav(documentReturnNav);
              }}
              onApproved={() => setNotificationsRefreshKey((key) => key + 1)}
              onSubmittedForApproval={() => setNotificationsRefreshKey((key) => key + 1)}
            />
          ) : isMyDrafts ? (
            <MyDraftsView
              refreshKey={draftsRefreshKey}
              onNewDocument={() => setActiveNav('document-register')}
              onDocumentClick={(id, options) => openDocument(id, options, 'my-drafts')}
            />
          ) : isNotifications ? (
            <NotificationsView
              refreshKey={notificationsRefreshKey}
              onNotificationClick={(notification) => handleNotificationClick(notification, 'notifications')}
              onNotificationsChange={bumpNotificationsRefresh}
            />
          ) : isNotificationHistory ? (
            <NotificationHistoryView
              refreshKey={notificationsRefreshKey}
              filterDocumentId={historyFilterDocumentId}
              onDocumentClick={(id) => openDocument(id, undefined, 'notification-history')}
            />
          ) : isDocumentView ? (
            <DocumentRegisterView
              mode={documentMode}
              refreshKey={notificationsRefreshKey}
              onNewDocument={() => setActiveNav('document-register')}
              onDocumentClick={(id, options) => openDocument(id, options, 'documents')}
              onSubmittedForApproval={() => setNotificationsRefreshKey((key) => key + 1)}
              onOpenHistory={(documentId) => openHistory(documentId)}
            />
          ) : isModuleView && moduleId ? (
            <ModuleVisualizationView moduleId={moduleId} />
          ) : (
            <DashboardOverview onModuleClick={handleModuleClick} />
          )}
        </main>
      </div>
    </div>
  );
}
