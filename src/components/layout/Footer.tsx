import { Link } from 'react-router-dom';
import { footerNavigation } from '../../data/navigation';
import { brand } from '../../data/brand';
import logo from '../../assets/daros-logo.png';
import './Footer.css';

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <img src={logo} alt="daros" />
            <p>{brand.mission}</p>
          </div>

          <div>
            <h4 className="footer-column-title">Platform</h4>
            <ul className="footer-links">
              {footerNavigation.platform.map((link) => (
                <li key={link.label}>
                  <Link to={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="footer-column-title">Solutions</h4>
            <ul className="footer-links">
              {footerNavigation.solutions.map((link) => (
                <li key={link.label}>
                  <Link to={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="footer-column-title">Resources</h4>
            <ul className="footer-links">
              {footerNavigation.resources.map((link) => (
                <li key={link.label}>
                  <Link to={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="footer-column-title">Company</h4>
            <ul className="footer-links">
              {footerNavigation.company.map((link) => (
                <li key={link.label}>
                  <Link to={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} {brand.fullName}. All rights reserved.</span>
          <span>{brand.domain}</span>
        </div>
      </div>
    </footer>
  );
}
