import {
  DashSidebar,
  DashSidebarBackdrop,
  DashSidebarFooter,
  DashSidebarHeader,
  DashSidebarLink,
  DashSidebarLinkIcon,
  DashSidebarLogoFull,
  DashSidebarLogoIcon,
  DashSidebarLogoWrap,
  DashSidebarNav,
  DashSidebarSection,
  DashSidebarSectionLabel,
} from './DashboardSidebar.styles';
import { Link } from 'react-router-dom';
import { dashboardSidebarSections } from '../../../data/sidebarNav';
import { SidebarIcon } from './SidebarIcon';
import logo from '../../../assets/daros-logo.png';
import logoIcon from '../../../assets/daros-logo-icon.png';

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
    if (window.matchMedia('(min-width: 1025px)').matches) {
      onHoverChange?.(true);
    }
  }

  function handleMouseLeave() {
    if (window.matchMedia('(min-width: 1025px)').matches) {
      onHoverChange?.(false);
    }
  }

  return (
    <>
      <DashSidebarBackdrop $visible={isOpen} onClick={onClose} aria-hidden="true" />

      <DashSidebar
        $open={isOpen}
        $collapsed={isCollapsed}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <DashSidebarHeader>
          <DashSidebarLogoWrap as={Link} to="/" title="daros">
            <DashSidebarLogoFull src={logo} alt="daros" />
            <DashSidebarLogoIcon src={logoIcon} alt="daros" />
          </DashSidebarLogoWrap>
        </DashSidebarHeader>

        <DashSidebarNav>
          {dashboardSidebarSections.map((section) => (
            <DashSidebarSection key={section.id}>
              {!isCollapsed && (
                <DashSidebarSectionLabel>
                  <span>{section.label}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </DashSidebarSectionLabel>
              )}
              {section.items.map((item) => (
                <DashSidebarLink
                  key={item.id}
                  type="button"
                  $active={activeNav === item.id}
                  onClick={() => handleNavClick(item.id)}
                  title={isCollapsed ? item.label : undefined}
                >
                  <DashSidebarLinkIcon>
                    <SidebarIcon name={item.icon} />
                  </DashSidebarLinkIcon>
                  {!isCollapsed && item.label}
                </DashSidebarLink>
              ))}
            </DashSidebarSection>
          ))}
        </DashSidebarNav>

        <DashSidebarFooter>
          <DashSidebarLink type="button" title={isCollapsed ? 'Settings' : undefined}>
            <DashSidebarLinkIcon>
              <SidebarIcon name="settings" />
            </DashSidebarLinkIcon>
            {!isCollapsed && 'Settings'}
          </DashSidebarLink>
          <DashSidebarLink as={Link} to="/" $back title={isCollapsed ? 'Back to website' : undefined}>
            <DashSidebarLinkIcon>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
            </DashSidebarLinkIcon>
            {!isCollapsed && 'Back to website'}
          </DashSidebarLink>
        </DashSidebarFooter>
      </DashSidebar>
    </>
  );
}
