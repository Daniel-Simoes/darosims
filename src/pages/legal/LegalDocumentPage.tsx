import { Link, Navigate, useParams } from 'react-router-dom';
import { PublicSiteLayout } from '../../components/layout/PublicSiteLayout';
import {
  getLegalDocument,
  isLegalSlugRedirectOnly,
  resolveLegalSlug,
} from '../../data/legalDocuments';
import './LegalPages.css';

export function LegalDocumentPage() {
  const { slug } = useParams<{ slug: string }>();

  if (!slug) {
    return <Navigate to="/" replace />;
  }

  if (isLegalSlugRedirectOnly(slug)) {
    const target = resolveLegalSlug(slug);
    if (target) {
      return <Navigate to={`/legal/${target}`} replace />;
    }
  }

  const doc = getLegalDocument(slug);
  if (!doc) {
    return <Navigate to="/" replace />;
  }

  return (
    <PublicSiteLayout>
      <article className="legal-page">
        <div className="container legal-page-inner">
          <nav className="legal-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span aria-hidden="true"> / </span>
            <span>Legal</span>
            <span aria-hidden="true"> / </span>
            <span>{doc.title}</span>
          </nav>
          <header className="legal-header">
            <h1>{doc.title}</h1>
            <p className="legal-summary">{doc.summary}</p>
            <p className="legal-updated">Last updated: {doc.lastUpdated}</p>
          </header>
          <div className="legal-sections">
            {doc.sections.map((section) => (
              <section key={section.heading} className="legal-section">
                <h2>{section.heading}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </section>
            ))}
          </div>
          <p className="legal-footer-links">
            <Link to="/legal/data-request">Data subject request</Link>
            {' · '}
            <Link to="/legal/privacy">Privacy</Link>
            {' · '}
            <Link to="/legal/terms">Terms</Link>
          </p>
        </div>
      </article>
    </PublicSiteLayout>
  );
}