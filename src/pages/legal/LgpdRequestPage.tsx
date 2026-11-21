import { type FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { PublicSiteLayout } from '../../components/layout/PublicSiteLayout';
import {
  companyLegal,
  dataSubjectRequestTypeLabels,
  type DataSubjectRequestType,
} from '../../data/companyLegal';
import { submitLgpdRequest } from '../../lib/api/lgpd';
import './LegalPages.css';

export function LgpdRequestPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [requestType, setRequestType] = useState<DataSubjectRequestType>('access');
  const [message, setMessage] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!accepted) {
      setError('Please confirm you have read the Privacy Policy before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitLgpdRequest({
        name: name.trim(),
        email: email.trim(),
        requestType,
        message: message.trim() || undefined,
      });
      setSuccess(true);
      setName('');
      setEmail('');
      setMessage('');
      setAccepted(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'We could not send your request.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PublicSiteLayout>
      <article className="legal-page lgpd-page">
        <div className="container legal-page-inner">
          <nav className="legal-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span aria-hidden="true"> / </span>
            <span>Data subject request</span>
          </nav>
          <header className="legal-header">
            <h1>Data subject request form</h1>
            <p className="legal-summary">
              Request access, correction, deletion, or other rights under applicable privacy law
              (including LGPD where it applies). We collect only the fields needed to respond.
            </p>
          </header>

          <p className="lgpd-hint">
            Privacy contact: {companyLegal.privacyEmail}. We respond within the timeframe required by
            applicable law.
          </p>

          {success ? (
            <div className="lgpd-success" role="status">
              Request received. We will contact you at the email you provided.
            </div>
          ) : (
            <form className="lgpd-form" onSubmit={handleSubmit} noValidate>
              {error ? <div className="lgpd-error">{error}</div> : null}

              <input
                type="text"
                name="website"
                className="visually-hidden"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value=""
                readOnly
              />

              <label>
                Full name
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                  disabled={isSubmitting}
                />
              </label>

              <label>
                Contact email
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  disabled={isSubmitting}
                />
              </label>

              <label>
                Request type
                <select
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value as DataSubjectRequestType)}
                  disabled={isSubmitting}
                >
                  {(Object.keys(dataSubjectRequestTypeLabels) as DataSubjectRequestType[]).map(
                    (key) => (
                      <option key={key} value={key}>
                        {dataSubjectRequestTypeLabels[key]}
                      </option>
                    ),
                  )}
                </select>
              </label>

              <label>
                Details (optional)
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your request or which records it relates to"
                  disabled={isSubmitting}
                />
              </label>

              <label className="lgpd-privacy-note">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                  disabled={isSubmitting}
                />{' '}
                I have read the{' '}
                <Link to="/legal/privacy" target="_blank" rel="noopener noreferrer">
                  Privacy Policy
                </Link>{' '}
                and I authorise processing of this form’s data solely to handle my request.
              </label>

              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Sending…' : 'Submit request'}
              </button>
            </form>
          )}
        </div>
      </article>
    </PublicSiteLayout>
  );
}