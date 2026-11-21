import { getLegalDocument, type LegalDocumentSlug } from '../../../data/legalDocuments';
import './DashboardLegalView.css';

interface DashboardLegalViewProps {
  slug: LegalDocumentSlug;
}

export function DashboardLegalView({ slug }: DashboardLegalViewProps) {
  const doc = getLegalDocument(slug);
  if (!doc) {
    return (
      <div className="dash-legal-empty">
        <p>This document is not available.</p>
      </div>
    );
  }

  return (
    <article className="dash-legal-view">
      <header className="dash-legal-header">
        <h2>{doc.title}</h2>
        <p className="dash-legal-summary">{doc.summary}</p>
        <p className="dash-legal-updated">Last updated: {doc.lastUpdated}</p>
      </header>
      {doc.sections.map((section) => (
        <section key={section.heading} className="dash-legal-section">
          <h3>{section.heading}</h3>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </section>
      ))}
    </article>
  );
}