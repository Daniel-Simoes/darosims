import styled from 'styled-components';

export const Navbar = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--nav-height);
  background: rgba(255, 255, 255, 0.97);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color-border);
  z-index: 1000;
  overflow: visible;

  & nav {
    overflow: visible;
  }
  @media (max-width: 1024px) {
    &-nav {
      display: none;
    }
    &-mobile-toggle {
      display: block;
    }
    &-actions .btn-outline {
      display: none;
    }
  }

  @media (max-width: 640px) {
    &-actions .btn-primary {
      display: none;
    }
  }

`;

export const NavbarActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  @media (max-width: 1024px) {
    & .btn-outline {
      display: none;
    }
  }

  @media (max-width: 640px) {
    & .btn-primary {
      display: none;
    }
  }

`;

export const NavbarInner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  overflow: visible;
`;

export const NavbarItem = styled.div`
  position: relative;

  &.active .navbar-link {
    color: var(--color-primary);
  }

  &.active .navbar-link-chevron {
    transform: rotate(180deg);
  }
`;

export const NavbarLink = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
  border-radius: var(--radius-sm);
  transition: color 0.15s ease;
  background: none;
  border: none;
  cursor: pointer;

  color: var(--color-primary);
`;

export const NavbarLinkChevron = styled.div`
  font-size: 10px;
  transition: transform 0.2s ease;
`;

export const NavbarLogo = styled.img`
  & img {
    height: 32px;
  width: auto;
  display: block;
  }
`;

export const NavbarMobileToggle = styled.button`
  display: none;
  padding: 8px;
  font-size: 24px;
  @media (max-width: 1024px) {
    & {
      display: block;
    }
  }

`;

export const NavbarNav = styled.nav`
  overflow: visible;

  display: flex;
  align-items: center;
  gap: 4px;
  list-style: none;
  @media (max-width: 1024px) {
    & {
      display: none;
    }
  }

`;

