import { Link } from 'react-router-dom';
import type { NavSection } from '../../data/navigation';
import './MegaMenu.css';

interface MegaMenuProps {
  sections: NavSection[];
  onNavigate?: () => void;
}

export function MegaMenu({ sections, onNavigate }: MegaMenuProps) {
  return (
    <div className="mega-menu">
      <div className="container">
        <div className="mega-menu-inner">
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="mega-menu-section-title">{section.title}</h3>
              <ul className="mega-menu-links">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.href} className="mega-menu-link" onClick={onNavigate}>
                      <span className="mega-menu-link-label">{link.label}</span>
                      {link.description && (
                        <span className="mega-menu-link-desc">{link.description}</span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
