import {
  Showcase,
  ShowcaseDescription,
  ShowcaseImageGlow,
  ShowcaseImageWrap,
  ShowcaseTitle,
} from './ShowcaseSection.styles';
import { Link } from 'react-router-dom';
import { images } from '../../data/images';

const showcases = [
  {
    title: 'Real-time compliance visibility',
    description:
      'Track your compliance score, open actions and audit readiness from a single dashboard. No more scattered spreadsheets or outdated reports.',
    image: images.analytics,
    alt: 'Analytics dashboard showing compliance metrics',
    reverse: false,
  },
  {
    title: 'Built for how SMEs actually work',
    description:
      'Daros replaces paper-based systems with a cloud platform designed for organisations of 10–250 employees across Ireland and the UK.',
    image: images.teamCollaboration,
    alt: 'Team collaborating on compliance workflows',
    reverse: true,
  },
  {
    title: 'From planning to certification',
    description:
      'Structure your path to ISO 9001, 14001, 45001 and 22000 with guided workflows, document control and audit preparation tools.',
    image: images.compliancePlanning,
    alt: 'Business planning and compliance documentation',
    reverse: false,
  },
];

export function ShowcaseSection() {
  return (
    <Showcase>
      {showcases.map((item) => (
        <div key={item.title} className={`showcase-row ${item.reverse ? 'reverse' : ''}`}>
          <div className="container showcase-inner">
            <div className="showcase-text">
              <ShowcaseTitle>{item.title}</ShowcaseTitle>
              <ShowcaseDescription>{item.description}</ShowcaseDescription>
              <Link to="/signin" className="showcase-link">
                Explore the dashboard →
              </Link>
            </div>
            <ShowcaseImageWrap>
              <img src={item.image} alt={item.alt} className="showcase-image" loading="lazy" />
              <ShowcaseImageGlow />
            </ShowcaseImageWrap>
          </div>
        </div>
      ))}
    </Showcase>
  );
}
