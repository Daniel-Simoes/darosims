import {
  FeatureDescription,
  FeatureIcon,
  FeatureTitle,
  Features,
  FeaturesBanner,
  FeaturesBannerOverlay,
  FeaturesBannerText,
  FeaturesBannerTitle,
  FeaturesGrid,
} from './FeaturesSection.styles';
import { images } from '../../data/images';

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
    <Features id="platform">
      <FeaturesBanner>
        <img
          src={images.workspace}
          alt="Modern workspace using Daros platform"
          className="features-banner-image"
          loading="lazy"
        />
        <FeaturesBannerOverlay>
          <div className="container">
            <FeaturesBannerTitle>Replace spreadsheets with intelligence</FeaturesBannerTitle>
            <FeaturesBannerText>
              Everything your organisation needs to manage compliance — in one connected platform.
            </FeaturesBannerText>
          </div>
        </FeaturesBannerOverlay>
      </FeaturesBanner>

      <div className="container features-body">
        <div className="section-header">
          <h2 className="section-title">One platform. Complete control.</h2>
          <p className="section-subtitle">
            Replace spreadsheets and paper-based systems with an intuitive, intelligent
            Integrated Management System built for SMEs.
          </p>
        </div>

        <FeaturesGrid>
          {features.map((feature) => (
            <div key={feature.title} className="feature-card">
              <FeatureIcon>{feature.icon}</FeatureIcon>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
            </div>
          ))}
        </FeaturesGrid>
      </div>
    </Features>
  );
}
