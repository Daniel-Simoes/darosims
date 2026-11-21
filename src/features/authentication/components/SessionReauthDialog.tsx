import { type FormEvent, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import './SessionReauthDialog.css';

interface SessionReauthDialogProps {
  open: boolean;
  defaultEmail: string;
  onLogin: (email: string, password: string) => Promise<void>;
}

export function SessionReauthDialog({ open, defaultEmail, onLogin }: SessionReauthDialogProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setEmail(defaultEmail);
      setPassword('');
      setError('');
      setIsSubmitting(false);
    }
  }, [open, defaultEmail]);

  if (!open) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await onLogin(email.trim(), password);
      setPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed. Check your password and try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return createPortal(
  <div className="session-reauth-overlay" role="presentation">
    <div
      className="session-reauth-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-reauth-title"
      aria-describedby="session-reauth-desc"
    >
      <h2 id="session-reauth-title" className="session-reauth-title">
        Session timed out
      </h2>
      <p id="session-reauth-desc" className="session-reauth-message">
        Because there was no activity for 20 minutes, you need to sign in again to continue using the
        dashboard.
      </p>

      <form className="session-reauth-form" onSubmit={handleSubmit}>
        <label className="session-reauth-label">
          Email
          <input
            className="session-reauth-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
            disabled={isSubmitting}
          />
        </label>

        <label className="session-reauth-label">
          Password
          <input
            className="session-reauth-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            autoFocus
            disabled={isSubmitting}
          />
        </label>

        {error ? <p className="session-reauth-error">{error}</p> : null}

        <button type="submit" className="session-reauth-submit" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in…' : 'Sign in again'}
        </button>
      </form>
    </div>
  </div>,
    document.body,
  );
}