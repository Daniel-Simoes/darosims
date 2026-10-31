import {
  Footer as FooterRoot,
  FooterBottom,
  FooterBrand,
  FooterColumnTitle,
  FooterGrid,
  FooterLinks,
} from './Footer.styles';
import { Link } from 'react-router-dom';
import { footerNavigation } from '../../data/navigation';
import { brand } from '../../data/brand';
import logo from '../../assets/daros-logo.png';

export function Footer() {
  return (
    <FooterRoot>
      <div className="container">
        <FooterGrid>
          <FooterBrand>
            <img src={logo} alt="daros" />
            <p>{brand.mission}</p>
          </FooterBrand>

          <div>
            <FooterColumnTitle>Platform</FooterColumnTitle>
            <FooterLinks>
              {footerNavigation.platform.map((link) => (
                <li key={link.label}>
                  <Link to={link.href}>{link.label}</Link>
                </li>
              ))}
            </FooterLinks>
          </div>

          <div>
            <FooterColumnTitle>Solutions</FooterColumnTitle>
            <FooterLinks>
              {footerNavigation.solutions.map((link) => (
                <li key={link.label}>
                  <Link to={link.href}>{link.label}</Link>
                </li>
              ))}
            </FooterLinks>
          </div>

          <div>
            <FooterColumnTitle>Resources</FooterColumnTitle>
            <FooterLinks>
              {footerNavigation.resources.map((link) => (
                <li key={link.label}>
                  <Link to={link.href}>{link.label}</Link>
                </li>
              ))}
            </FooterLinks>
          </div>

          <div>
            <FooterColumnTitle>Company</FooterColumnTitle>
            <FooterLinks>
              {footerNavigation.company.map((link) => (
                <li key={link.label}>
                  <Link to={link.href}>{link.label}</Link>
                </li>
              ))}
            </FooterLinks>
          </div>
        </FooterGrid>

        <FooterBottom>
          <span>© {new Date().getFullYear()} {brand.fullName}. All rights reserved.</span>
          <span>{brand.domain}</span>
        </FooterBottom>
      </div>
    </FooterRoot>
  );
}
