import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { hasCookieConsentAnswer, setCookieConsentEssential } from '../../lib/cookies/cookieConsent';
import './CookieConsent.css';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(!hasCookieConsentAnswer());
  }, []);

  if (!visible) return null;

  function accept() {
    setCookieConsentEssential();
    setVisible(false);
  }

  return (
    <div className="cookie-consent" role="dialog" aria-live="polite" aria-label="Cookie notice">
      <p className="cookie-consent-text">
        We use <strong>essential cookies only</strong> and a local preference for this notice. We do
        not enable marketing tracking (Google Analytics, pixels, etc.) on this site.{' '}
        <Link to="/legal/cookies">Cookie notice</Link>
      </p>
      <button type="button" className="btn btn-primary cookie-consent-btn" onClick={accept}>
        Accept essentials
      </button>
    </div>
  );
}