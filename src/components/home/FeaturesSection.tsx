import { images } from '../../data/images';
import './FeaturesSection.css';

const features = [
  {
    icon: '⚙️',
    title: 'Process Management',
    description: 'Map, monitor and improve business workflows with full traceability across your organisation.',
  },
  {
    icon: '📄',
    title: 'Document Management',
    description: 'Centralised document control with version tracking, approvals and audit-ready records.',
  },
  {
    icon: '⚠️',
    title: 'Risk Management',
    description: 'Identify, assess and mitigate operational and compliance risks before they escalate.',
  },
  {
    icon: '🔍',
    title: 'Audits',
    description: 'Plan, schedule and report on internal and external audits with structured checklists.',
  },
  {
    icon: '🏭',
    title: 'Supplier Management',
    description: 'Evaluate and monitor third-party supplier compliance and performance.',
  },
  {
    icon: '❌',
    title: 'Nonconformities',
    description: 'Track issues, root causes and corrective actions through to closure.',
  },
  {
    icon: '📊',
    title: 'KPIs',
    description: 'Monitor key performance indicators with real-time dashboards and alerts.',
  },
  {
    icon: '📈',
    title: 'Continual Improvement',
    description: 'Drive ongoing enhancements with structured improvement initiatives and tracking.',
  },
];

export function FeaturesSection() {
  return (
    <section className="features" id="platform">
      <div className="features-banner">
        <img
          src={images.workspace}
          alt="Modern workspace using Daros platform"
          className="features-banner-image"
          loading="lazy"
        />
        <div className="features-banner-overlay">
          <div className="container">
            <h2 className="features-banner-title">Replace spreadsheets with intelligence</h2>
            <p className="features-banner-text">
              Everything your organisation needs to manage compliance — in one connected platform.
            </p>
          </div>
        </div>
      </div>

      <div className="container features-body">
        <div className="section-header">
          <h2 className="section-title">One platform. Complete control.</h2>
          <p className="section-subtitle">
            Replace spreadsheets and paper-based systems with an intuitive, intelligent
            Integrated Management System built for SMEs.
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature) => (
            <div key={feature.title} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
