import { createPortal } from 'react-dom';
import logoIcon from '../../assets/daros-logo-icon.png';
import './DarosActionLoadingOverlay.css';

interface DarosActionLoadingOverlayProps {
  active: boolean;
  label?: string;
}

export function DarosActionLoadingOverlay({ active, label = 'Processing…' }: DarosActionLoadingOverlayProps) {
  if (!active) return null;

  return createPortal(
    <div className="daros-action-loading" role="status" aria-live="polite" aria-busy="true">
      <div className="daros-action-loading-card">
        <div className="daros-action-loading-icon-wrap">
          <span className="daros-action-loading-ring" aria-hidden="true" />
          <span className="daros-action-loading-ring daros-action-loading-ring-delay" aria-hidden="true" />
          <img src={logoIcon} alt="" className="daros-action-loading-icon" />
        </div>
        <p className="daros-action-loading-label">{label}</p>
      </div>
    </div>,
    document.body,
  );
}