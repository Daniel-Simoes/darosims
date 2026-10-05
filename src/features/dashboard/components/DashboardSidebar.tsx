import { Link } from 'react-router-dom';
import { dashboardSidebarSections } from '../../../data/sidebarNav';
import { SidebarIcon } from './SidebarIcon';
import logo from '../../../assets/daros-logo.png';
import logoIcon from '../../../assets/daros-logo-icon.png';
import './DashboardSidebar.css';

interface DashboardSidebarProps {
  activeNav: string;
  onNavChange: (id: string) => void;
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
  onHoverChange?: (hovered: boolean) => void;
}

export function DashboardSidebar({
  activeNav,
  onNavChange,
  isOpen,
  isCollapsed,
  onClose,
  onHoverChange,
}: DashboardSidebarProps) {
  function handleNavClick(id: string) {
    onNavChange(id);
    onClose();
  }

  function handleMouseEnter() {
    if (window.matchMedia('(min-width: 901px)').matches) {
      onHoverChange?.(true);
    }
  }

  function handleMouseLeave() {
    if (window.matchMedia('(min-width: 901px)').matches) {
      onHoverChange?.(false);
    }
  }

  return (
    <>
      <div
        className={`dash-sidebar-backdrop ${isOpen ? 'visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`dash-sidebar ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="dash-sidebar-header">
          <Link to="/" className="dash-sidebar-logo-wrap" title="daros">
            <img src={logo} alt="daros" className="dash-sidebar-logo dash-sidebar-logo-full" />
            <img src={logoIcon} alt="daros" className="dash-sidebar-logo dash-sidebar-logo-icon" />
          </Link>
        </div>

        <nav className="dash-sidebar-nav">
          {dashboardSidebarSections.map((section) => (
            <div key={section.id} className="dash-sidebar-section">
              {!isCollapsed && (
                <div className="dash-sidebar-section-label">
                  <span>{section.label}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
              )}
              {section.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`dash-sidebar-link ${activeNav === item.id ? 'active' : ''}`}
                  onClick={() => handleNavClick(item.id)}
                  title={isCollapsed ? item.label : undefined}
                >
                  <span className="dash-sidebar-link-icon">
                    <SidebarIcon name={item.icon} />
                  </span>
                  {!isCollapsed && item.label}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="dash-sidebar-footer">
          <button type="button" className="dash-sidebar-link" title={isCollapsed ? 'Settings' : undefined}>
            <span className="dash-sidebar-link-icon">
              <SidebarIcon name="settings" />
            </span>
            {!isCollapsed && 'Settings'}
          </button>
          <Link
            to="/"
            className="dash-sidebar-link dash-sidebar-back"
            title={isCollapsed ? 'Back to website' : undefined}
          >
            <span className="dash-sidebar-link-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
            </span>
            {!isCollapsed && 'Back to website'}
          </Link>
        </div>
      </aside>
    </>
  );
}
