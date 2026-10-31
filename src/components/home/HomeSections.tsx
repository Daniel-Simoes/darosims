import { brand } from '../../data/brand';
import { images } from '../../data/images';
import './HomeSections.css';

const standards = [
  {
    code: 'ISO 9001',
    name: 'Quality Management',
    description: 'Meet customer requirements and drive consistent quality across operations.',
    image: images.modernOffice,
  },
  {
    code: 'ISO 14001',
    name: 'Environmental Management',
    description: 'Manage environmental impact and demonstrate sustainability commitment.',
    image: images.workspace,
  },
  {
    code: 'ISO 45001',
    name: 'Health & Safety',
    description: 'Protect workers and create safer workplaces through systematic management.',
    image: images.teamCollaboration,
  },
  {
    code: 'ISO 22000',
    name: 'Food Safety',
    description: 'Ensure food safety throughout the supply chain with HACCP principles.',
    image: images.compliancePlanning,
  },
];

export function StandardsSection() {
  return (
    <section className="standards" id="solutions">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Built for international standards</h2>
          <p className="section-subtitle">
            Daros is designed around ISO 9001, ISO 14001, ISO 45001 and ISO 22000 —
            giving your organisation a structured path to certification.
          </p>
        </div>

        <div className="standards-grid">
          {standards.map((standard) => (
            <div key={standard.code} className="standard-card">
              <div className="standard-card-image-wrap">
                <img
                  src={standard.image}
                  alt={standard.name}
                  className="standard-card-image"
                  loading="lazy"
                />
                <div className="standard-card-badge">{standard.code}</div>
              </div>
              <div className="standard-card-body">
                <div className="standard-name">{standard.name}</div>
                <p className="standard-description">{standard.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function MissionSection() {
  return (
    <section className="mission" id="mission">
      <img
        src={images.modernOffice}
        alt=""
        className="mission-bg"
        aria-hidden="true"
        loading="lazy"
      />
      <div className="mission-overlay" />
      <div className="container mission-content">
        <blockquote className="mission-quote">"{brand.mission}"</blockquote>
        <p className="mission-author">— {brand.fullName}</p>
      </div>
    </section>
  );
}

export function ValuesSection() {
  return (
    <section className="values" id="values">
      <div className="container values-grid">
        <div className="values-image-wrap">
          <img
            src={images.teamCollaboration}
            alt="Daros team values in action"
            className="values-image"
            loading="lazy"
          />
        </div>
        <div className="values-content">
          <h2 className="section-title">Our core values</h2>
          <p className="section-subtitle values-subtitle">
            The principles that guide everything we build at Daros.
          </p>
          <div className="values-tags">
            {brand.values.map((value) => (
              <span key={value} className="value-tag">{value}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function CTASection() {
  return (
    <section className="cta" id="demo">
      <img
        src={images.analytics}
        alt=""
        className="cta-bg"
        aria-hidden="true"
        loading="lazy"
      />
      <div className="cta-overlay" />
      <div className="container cta-content">
        <h2 className="cta-title">Ready to simplify your management system?</h2>
        <p className="cta-description">
          Join SMEs across Ireland and the UK who are replacing spreadsheets
          with an integrated compliance platform.
        </p>
        <div className="cta-actions">
          <a href="#contact" className="btn btn-primary">Request a Demo</a>
          <a href="#contact" className="btn btn-outline">Contact Sales</a>
        </div>
      </div>
    </section>
  );
}
