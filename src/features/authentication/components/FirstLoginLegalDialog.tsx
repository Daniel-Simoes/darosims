import { useState } from 'react';
import { Link } from 'react-router-dom';
import './FirstLoginLegalDialog.css';

interface FirstLoginLegalDialogProps {
  open: boolean;
  onAccept: () => Promise<void>;
}

export function FirstLoginLegalDialog({ open, onAccept }: FirstLoginLegalDialogProps) {
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!open) return null;

  const canSubmit = acceptPrivacy && acceptTerms && !isSubmitting;

  async function handleContinue() {
    setError('');
    if (!acceptPrivacy || !acceptTerms) {
      setError('Please accept both the Privacy Policy and Terms of Service to continue.');
      return;
    }
    setIsSubmitting(true);
    try {
      await onAccept();
      setAcceptPrivacy(false);
      setAcceptTerms(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save your acceptance.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="first-login-legal-overlay" role="presentation">
      <div
        className="first-login-legal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="first-login-legal-title"
      >
        <header className="first-login-legal-header">
          <span className="first-login-legal-badge">System security</span>
          <h2 id="first-login-legal-title">Before you continue</h2>
          <p>
            Your sign-in was successful. To use Daros, confirm that you have read and accept our
            legal terms. You only need to do this once for your account.
          </p>
        </header>

        {error ? <div className="first-login-legal-error">{error}</div> : null}

        <div className="first-login-legal-checks">
          <label className="first-login-legal-check">
            <input
              type="checkbox"
              checked={acceptPrivacy}
              onChange={(e) => setAcceptPrivacy(e.target.checked)}
              disabled={isSubmitting}
            />
            <span>
              I have read and accept the{' '}
              <Link to="/legal/privacy" target="_blank" rel="noopener noreferrer">
                Privacy Policy
              </Link>
              .
            </span>
          </label>
          <label className="first-login-legal-check">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              disabled={isSubmitting}
            />
            <span>
              I have read and accept the{' '}
              <Link to="/legal/terms" target="_blank" rel="noopener noreferrer">
                Terms of Service
              </Link>
              .
            </span>
          </label>
        </div>

        <p className="first-login-legal-hint">
          You can reopen these documents anytime from the bottom of the sidebar (Privacy Policy and
          Accessibility).
        </p>

        <button
          type="button"
          className="btn btn-primary first-login-legal-continue"
          disabled={!canSubmit}
          onClick={() => void handleContinue()}
        >
          {isSubmitting ? 'Saving…' : 'Continue to dashboard'}
        </button>
      </div>
    </div>
  );
}