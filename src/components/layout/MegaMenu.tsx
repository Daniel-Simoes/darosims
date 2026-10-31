import {
  MegaMenu as MegaMenuRoot,
  MegaMenuLinkDesc,
  MegaMenuLinkLabel,
  MegaMenuLinks,
  MegaMenuSectionTitle,
} from './MegaMenu.styles';
import { Link } from 'react-router-dom';
import type { NavSection } from '../../data/navigation';

interface MegaMenuProps {
  sections: NavSection[];
  onNavigate?: () => void;
}

export function MegaMenu({ sections, onNavigate }: MegaMenuProps) {
  return (
    <MegaMenuRoot>
      <div className="container">
        <div className="mega-menu-inner">
          {sections.map((section) => (
            <div key={section.title}>
              <MegaMenuSectionTitle>{section.title}</MegaMenuSectionTitle>
              <MegaMenuLinks>
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.href} className="mega-menu-link" onClick={onNavigate}>
                      <MegaMenuLinkLabel>{link.label}</MegaMenuLinkLabel>
                      {link.description && (
                        <MegaMenuLinkDesc>{link.description}</MegaMenuLinkDesc>
                      )}
                    </Link>
                  </li>
                ))}
              </MegaMenuLinks>
            </div>
          ))}
        </div>
      </div>
    </MegaMenuRoot>
  );
}
