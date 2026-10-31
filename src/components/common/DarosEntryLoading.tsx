import logoIcon from '../../assets/daros-logo-icon.png';
import './DarosEntryLoading.css';

export function DarosEntryLoading() {
  return (
    <div className="daros-entry-loading" aria-live="polite" aria-busy="true">
      <div className="daros-entry-loading-icon-wrap">
        <span className="daros-entry-loading-ring" aria-hidden="true" />
        <span className="daros-entry-loading-ring daros-entry-loading-ring-delay" aria-hidden="true" />
        <img src={logoIcon} alt="" className="daros-entry-loading-icon" />
      </div>
    </div>
  );
}
