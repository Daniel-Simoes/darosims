import { HandheldAuthLink } from '../auth/HandheldAuthLink';
import { images } from '../../data/images';
import { imageCredits } from '../../data/imageCredits';
import './ShowcaseSection.css';

function creditAlt(id: string, fallback: string) {
  return imageCredits.find((entry) => entry.id === id)?.alt ?? fallback;
}

const showcases = [
  {
    title: 'Compliance visibility in one place',
    description:
      'Monitor open actions, document status and audit preparation from a single dashboard — without scattered spreadsheets or outdated reports.',
    image: images.analytics,
    alt: creditAlt('analytics', 'Operational metrics analysis'),
    reverse: false,
  },
  {
    title: 'Built for how SMEs actually work',
    description:
      'Daros replaces paper-based systems with a cloud platform designed for organisations of 10–250 employees across Ireland and the UK.',
    image: images.teamCollaboration,
    alt: creditAlt('team-collaboration', 'Collaboration on compliance work'),
    reverse: true,
  },
  {
    title: 'From planning to certification',
    description:
      'Structure your path to ISO 9001, 14001, 45001 and 22000 with guided workflows, document control and audit preparation tools.',
    image: images.compliancePlanning,
    alt: creditAlt('compliance-planning', 'Team compliance planning'),
    reverse: false,
  },
];

export function ShowcaseSection() {
  return (
    <section className="showcase">
      {showcases.map((item) => (
        <div key={item.title} className={`showcase-row ${item.reverse ? 'reverse' : ''}`}>
          <div className="container showcase-inner">
            <div className="showcase-text">
              <h2 className="showcase-title">{item.title}</h2>
              <p className="showcase-description">{item.description}</p>
              <HandheldAuthLink className="showcase-link">Explore the dashboard →</HandheldAuthLink>
            </div>
            <div className="showcase-image-wrap">
              <img src={item.image} alt={item.alt} className="showcase-image" loading="lazy" />
              <div className="showcase-image-glow" />
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
