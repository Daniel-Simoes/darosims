import styled from 'styled-components';

function sidebarClass(open?: boolean, collapsed?: boolean) {
  return ['dash-sidebar', open ? 'open' : '', collapsed ? 'collapsed' : ''].filter(Boolean).join(' ');
}

export const DashSidebar = styled.aside.attrs<{ $open?: boolean; $collapsed?: boolean }>((p) => ({
  className: sidebarClass(p.$open, p.$collapsed),
}))<{ $open?: boolean; $collapsed?: boolean }>`
  width: var(--sidebar-width, 220px);
  background: #1e293b;
  color: white;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 200;
  overflow: hidden;
  transition: width 0.2s ease, transform 0.2s ease;

  &.collapsed {
    width: var(--sidebar-collapsed-width, 68px);
  }

  &.collapsed .dash-sidebar-header {
    padding: 14px 8px 12px;
  display: flex;
  justify-content: center;
  }

  &.collapsed .dash-sidebar-link {
    justify-content: center;
  padding: 10px;
  }

  &.collapsed .dash-sidebar-footer .dash-sidebar-link {
    justify-content: center;
  }

  &.collapsed .dash-sidebar-logo-full {
    display: none;
  }

  &.collapsed .dash-sidebar-logo-icon {
    display: block;
  height: 34px;
  }
  @media (max-width: 1024px) {
    & {
      width: min(280px, 88vw);
    transform: translateX(-100%);
    box-shadow: none;
    }
    &.open {
      transform: translateX(0);
    box-shadow: 8px 0 32px rgba(15, 23, 42, 0.2);
    }
    &.collapsed {
      width: min(280px, 88vw);
    }
    &.collapsed .dash-sidebar-logo-full {
      display: block;
    }
    &.collapsed .dash-sidebar-logo-icon {
      display: none;
    }
    &.collapsed .dash-sidebar-link {
      justify-content: flex-start;
    padding: 7px 10px;
    }
    &.collapsed .dash-sidebar-header {
      padding: 18px 12px 16px;
    justify-content: flex-start;
    }
  }

  @media (max-width: 1280px) {
    &:not(.collapsed) {
      width: 200px;
    }
  }

`;

export const DashSidebarBack = styled.div`
  color: rgba(255, 255, 255, 0.45) !important;
  font-size: 11px !important;
  margin-top: 2px;

  color: rgba(255, 255, 255, 0.7) !important;
`;

export const DashSidebarBackdrop = styled.div.attrs<{ $visible?: boolean }>((p) => ({
  className: `dash-sidebar-backdrop${p.$visible ? ' visible' : ''}`,
}))<{ $visible?: boolean }>`
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  z-index: 150;
  opacity: 0;
  transition: opacity 0.2s ease;

  &.visible {
    display: block;
  opacity: 1;
  }
`;

export const DashSidebarFooter = styled.footer.attrs({ className: 'dash-sidebar-footer' })`
  padding: 10px 8px 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
`;

export const DashSidebarHeader = styled.header.attrs({ className: 'dash-sidebar-header' })`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
  @media (max-width: 1024px) {
    
  }

`;

export const DashSidebarLink = styled.button.attrs<{ $active?: boolean; $back?: boolean }>((p) => ({
  className: ['dash-sidebar-link', p.$active ? 'active' : '', p.$back ? 'dash-sidebar-back' : '']
    .filter(Boolean)
    .join(' '),
}))<{ $active?: boolean; $back?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 7px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.75);
  transition: background 0.15s ease, color 0.15s ease;
  margin-bottom: 1px;
  text-align: left;
  border: none;
  background: none;
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;

  background: rgba(255, 255, 255, 0.06);
  color: white;

  &.active {
    background: #2563eb;
  color: white;
  font-weight: 600;
  }

  &.active .dash-sidebar-link-icon {
    opacity: 1;
  }
  @media (max-width: 1024px) {
    
  }

`;

export const DashSidebarLinkIcon = styled.span.attrs({ className: 'dash-sidebar-link-icon' })`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  flex-shrink: 0;
  opacity: 0.85;
`;

export const DashSidebarLogo = styled.img.attrs({ className: 'dash-sidebar-logo' })`
  display: block;
  object-fit: contain;
  mix-blend-mode: screen;
`;

export const DashSidebarLogoFull = styled.img.attrs({ className: 'dash-sidebar-logo dash-sidebar-logo-full' })`
  height: 40px;
  width: auto;
  max-width: calc(100% - 8px);
  @media (max-width: 1024px) {
    
  }

`;

export const DashSidebarLogoIcon = styled.img.attrs({ className: 'dash-sidebar-logo dash-sidebar-logo-icon' })`
  display: none;
  height: 36px;
  width: auto;
  @media (max-width: 1024px) {
    
  }

`;

export const DashSidebarLogoWrap = styled.a.attrs({ className: 'dash-sidebar-logo-wrap' })`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  background: transparent;
  border-radius: 0;
  padding: 0;
  text-decoration: none;
`;

export const DashSidebarNav = styled.nav.attrs({ className: 'dash-sidebar-nav' })`
  flex: 1;
  padding: 6px 8px;
  overflow-y: auto;
  overflow-x: hidden;
`;

export const DashSidebarSection = styled.div.attrs({ className: 'dash-sidebar-section' })`
  margin-bottom: 2px;
`;

export const DashSidebarSectionLabel = styled.label`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px 4px;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
`;

