import { type FormEvent, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/authentication/context/AuthContext';
import { waitForEntryLoading } from '../../lib/entryLoading';
import { images } from '../../data/images';
import logo from '../../assets/daros-logo.png';
import './SignInPage.css';

export function SignInPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user, beginEntryLoading, endEntryLoading } = useAuth();
  const [email, setEmail] = useState('daniel@daros.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard';

  useEffect(() => {
    endEntryLoading();
  }, [endEntryLoading]);

  useEffect(() => {
    if (user && !isSubmitting) {
      navigate(from, { replace: true });
    }
  }, [user, from, navigate, isSubmitting]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    beginEntryLoading();

    const startedAt = Date.now();

    try {
      await login(email, password);
      await waitForEntryLoading(startedAt);

      navigate(from, { replace: true });
    } catch (err) {
      endEntryLoading();
      setError(err instanceof Error ? err.message : 'Sign in failed');
      setIsSubmitting(false);
    }
  }

  return (
    <div className="signin-page">
      <div className="signin-visual">
        <img
          src={images.heroDashboard}
          alt="Daros dashboard preview"
          className="signin-visual-image"
        />
        <div className="signin-visual-overlay">
          <div className="signin-visual-content">
            <img src={logo} alt="daros" className="signin-visual-logo" />
            <h2 className="signin-visual-title">Your compliance hub</h2>
            <p className="signin-visual-text">
              Manage processes, documents, risks, audits and KPIs — all in one integrated platform.
            </p>
            <ul className="signin-visual-features">
              <li>8 integrated IMS modules</li>
              <li>4 ISO standards supported</li>
              <li>Built for SMEs in IE & UK</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="signin-form-panel">
        <div className="signin-card">
          <div className="signin-logo">
            <img src={logo} alt="daros" />
          </div>

          <h1 className="signin-title">Welcome back</h1>
          <p className="signin-subtitle">Sign in to your Daros dashboard</p>

          <form className="signin-form" onSubmit={handleSubmit}>
            {error && <div className="signin-error">{error}</div>}

            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                placeholder="daniel@daros.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="signin-hint">
            Accounts: <code>daniel@daros.com</code> or <code>rodrigo@daros.com</code> (password <code>1234</code>)
          </p>

          <Link to="/" className="signin-back">
            ← Back to website
          </Link>
        </div>
      </div>
    </div>
  );
}
