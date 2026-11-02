import {
  getAppStoreLabel,
  getHandheldStorePlatform,
  type HandheldStorePlatform,
} from '../../../lib/device/handheldDetection';
import './DashboardMobileGate.css';

function StoreIcon({ platform }: { platform: HandheldStorePlatform }) {
  if (platform === 'ios') {
    return (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M16.365 1.43c0 1.14-.417 2.064-1.248 2.772-.786.68-1.703 1.014-2.751.942 0-1.098.426-2.015 1.278-2.751.852-.736 1.826-1.098 2.921-.963zm3.603 18.785c-.852 1.524-1.826 3.048-2.921 4.572-1.095 1.524-1.998 2.287-2.709 2.287-.567 0-1.095-.189-1.584-.567-.49-.378-1.018-.567-1.584-.567-.567 0-1.17.283-1.81.85-.642.567-1.18.85-1.614.85-1.095 0-2.079-1.095-2.951-3.285-.873-2.19-1.309-4.307-1.309-6.351 0-2.381.756-4.307 2.268-5.777 1.214-1.133 2.662-1.7 4.344-1.7.567 0 1.133.095 1.7.283.567.189 1.038.283 1.414.283.378 0 .897-.095 1.558-.283.708-.189 1.323-.283 1.844-.283 1.465 0 2.756.567 3.873 1.7-1.277 1.087-1.915 2.617-1.915 4.591 0 1.796.673 3.285 2.019 4.467z" />
      </svg>
    );
  }

  if (platform === 'android') {
    return (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85a.637.637 0 0 0-.83.22l-1.88 3.24a11.43 11.43 0 0 0-8.94 0L5.65 5.67a.643.643 0 0 0-.87-.22c-.29.16-.4.54-.26.85l1.84 3.18C2.92 11.03 1 14.22 1 17.88h22c0-3.66-1.92-6.85-5.4-8.4zM7 15.25a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5zm10 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5z" />
      </svg>
    );
  }

  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <rect x="7" y="2" width="10" height="20" rx="2" />
      <path d="M11 18h2" />
    </svg>
  );
}

export function DashboardMobileGate() {
  const platform = getHandheldStorePlatform();
  const storeLabel = getAppStoreLabel(platform);

  const storeMessage =
    platform === 'ios'
      ? 'When it launches, download Daros IMS from the Apple App Store.'
      : platform === 'android'
        ? 'When it launches, download Daros IMS from Google Play.'
        : 'When it launches, download Daros IMS from your device app store.';

  return (
    <div className="dashboard-mobile-gate">
      <div className="dashboard-mobile-gate-card">
        <div className="dashboard-mobile-gate-icon">
          <StoreIcon platform={platform} />
        </div>
        <h1>Mobile app in development</h1>
        <p className="dashboard-mobile-gate-lead">
          The Daros dashboard is designed for desktop computers. Phone and tablet access is not
          supported in the browser.
        </p>
        <p className="dashboard-mobile-gate-store">{storeMessage}</p>
        <div className="dashboard-mobile-gate-badge">
          <span className="dashboard-mobile-gate-badge-label">Coming soon on</span>
          <strong>{storeLabel}</strong>
        </div>
        <a href="/" className="dashboard-mobile-gate-link">
          Back to darosims.com
        </a>
      </div>
    </div>
  );
}
