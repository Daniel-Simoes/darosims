import {
  Navbar as NavbarRoot,
  NavbarActions,
  NavbarLink,
  NavbarLinkChevron,
  NavbarNav,
} from './Navbar.styles';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { mainNavigation } from '../../data/navigation';
import logo from '../../assets/daros-logo.png';
import { MegaMenu } from './MegaMenu';

export function Navbar() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const blockHoverOpenRef = useRef(false);
  const location = useLocation();

  const closeMenu = useCallback(() => {
    setActiveMenu(null);
    blockHoverOpenRef.current = true;
  }, []);

  useEffect(() => {
    closeMenu();
  }, [location.pathname, closeMenu]);

  return (
    <NavbarRoot
      onMouseLeave={() => {
        setActiveMenu(null);
        blockHoverOpenRef.current = false;
      }}
    >
      <div className="container navbar-inner">
        <Link to="/" className="navbar-logo">
          <img src={logo} alt="daros" />
        </Link>

        <nav>
          <NavbarNav>
            {mainNavigation.map((item) => (
              <li
                key={item.label}
                className={`navbar-item ${item.sections ? 'navbar-item-mega' : ''} ${activeMenu === item.label ? 'active' : ''}`}
                onMouseEnter={() => {
                  if (blockHoverOpenRef.current || !item.sections) return;
                  setActiveMenu(item.label);
                }}
              >
                <NavbarLink type="button">
                  {item.label}
                  {item.sections && <NavbarLinkChevron>▾</NavbarLinkChevron>}
                </NavbarLink>
                {item.sections && activeMenu === item.label && (
                  <MegaMenu sections={item.sections} onNavigate={closeMenu} />
                )}
              </li>
            ))}
          </NavbarNav>
        </nav>

        <NavbarActions>
          <Link to="/signin" className="btn btn-ghost">
            Sign In
          </Link>
          <a href="#contact" className="btn btn-outline">
            Contact Sales
          </a>
          <a href="#demo" className="btn btn-primary">
            Request Demo
          </a>
        </NavbarActions>
      </div>
    </NavbarRoot>
  );
}
