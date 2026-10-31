import {
  Cta,
  CtaActions,
  CtaDescription,
  CtaTitle,
  Mission,
  MissionAuthor,
  StandardCardBadge,
  StandardCardBody,
  StandardCardImageWrap,
  StandardDescription,
  StandardName,
  Standards,
  StandardsGrid,
  Values,
  ValuesImageWrap,
  ValuesTags,
} from './HomeSections.styles';
import { brand } from '../../data/brand';
import { images } from '../../data/images';

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
    <Standards id="solutions">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Built for international standards</h2>
          <p className="section-subtitle">
            Daros is designed around ISO 9001, ISO 14001, ISO 45001 and ISO 22000 —
            giving your organisation a structured path to certification.
          </p>
        </div>

        <StandardsGrid>
          {standards.map((standard) => (
            <div key={standard.code} className="standard-card">
              <StandardCardImageWrap>
                <img
                  src={standard.image}
                  alt={standard.name}
                  className="standard-card-image"
                  loading="lazy"
                />
                <StandardCardBadge>{standard.code}</StandardCardBadge>
              </StandardCardImageWrap>
              <StandardCardBody>
                <StandardName>{standard.name}</StandardName>
                <StandardDescription>{standard.description}</StandardDescription>
              </StandardCardBody>
            </div>
          ))}
        </StandardsGrid>
      </div>
    </Standards>
  );
}

export function MissionSection() {
  return (
    <Mission id="mission">
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
        <MissionAuthor>— {brand.fullName}</MissionAuthor>
      </div>
    </Mission>
  );
}

export function ValuesSection() {
  return (
    <Values id="values">
      <div className="container values-grid">
        <ValuesImageWrap>
          <img
            src={images.teamCollaboration}
            alt="Daros team values in action"
            className="values-image"
            loading="lazy"
          />
        </ValuesImageWrap>
        <div className="values-content">
          <h2 className="section-title">Our core values</h2>
          <p className="section-subtitle values-subtitle">
            The principles that guide everything we build at Daros.
          </p>
          <ValuesTags>
            {brand.values.map((value) => (
              <span key={value} className="value-tag">{value}</span>
            ))}
          </ValuesTags>
        </div>
      </div>
    </Values>
  );
}

export function CTASection() {
  return (
    <Cta id="demo">
      <img
        src={images.analytics}
        alt=""
        className="cta-bg"
        aria-hidden="true"
        loading="lazy"
      />
      <div className="cta-overlay" />
      <div className="container cta-content">
        <CtaTitle>Ready to simplify your management system?</CtaTitle>
        <CtaDescription>
          Join SMEs across Ireland and the UK who are replacing spreadsheets
          with an integrated compliance platform.
        </CtaDescription>
        <CtaActions>
          <a href="#contact" className="btn btn-primary">Request a Demo</a>
          <a href="#contact" className="btn btn-outline">Contact Sales</a>
        </CtaActions>
      </div>
    </Cta>
  );
}
