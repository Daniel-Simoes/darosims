import {
  FormGroup,
  SigninCard,
  SigninError,
  SigninForm,
  SigninFormPanel,
  SigninHint,
  SigninLogo,
  SigninPage,
  SigninSubtitle,
  SigninTitle,
  SigninVisual,
  SigninVisualContent,
  SigninVisualFeatures,
  SigninVisualOverlay,
  SigninVisualText,
  SigninVisualTitle,
} from './SignInPage.styles';
import { type FormEvent, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/authentication/context/AuthContext';
import { waitForEntryLoading } from '../../lib/entryLoading';
import { images } from '../../data/images';
import logo from '../../assets/daros-logo.png';

export function SignInPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user, beginEntryLoading, endEntryLoading } = useAuth();
  const [email, setEmail] = useState('daniel@daros.com');
  const [password, setPassword] = useState('1234');
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
    <SigninPage>
      <SigninVisual>
        <img
          src={images.heroDashboard}
          alt="Daros dashboard preview"
          className="signin-visual-image"
        />
        <SigninVisualOverlay>
          <SigninVisualContent>
            <img src={logo} alt="daros" className="signin-visual-logo" />
            <SigninVisualTitle>Your compliance hub</SigninVisualTitle>
            <SigninVisualText>
              Manage processes, documents, risks, audits and KPIs — all in one integrated platform.
            </SigninVisualText>
            <SigninVisualFeatures>
              <li>8 integrated IMS modules</li>
              <li>4 ISO standards supported</li>
              <li>Built for SMEs in IE & UK</li>
            </SigninVisualFeatures>
          </SigninVisualContent>
        </SigninVisualOverlay>
      </SigninVisual>

      <SigninFormPanel>
        <SigninCard>
          <SigninLogo>
            <img src={logo} alt="daros" />
          </SigninLogo>

          <SigninTitle>Welcome back</SigninTitle>
          <SigninSubtitle>Sign in to your Daros dashboard</SigninSubtitle>

          <SigninForm onSubmit={handleSubmit}>
            {error && <SigninError>{error}</SigninError>}

            <FormGroup>
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
            </FormGroup>

            <FormGroup>
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
            </FormGroup>

            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </SigninForm>

          <SigninHint>
            Accounts: <code>daniel@daros.com</code> or <code>rodrigo@daros.com</code> (password <code>1234</code>)
          </SigninHint>

          <Link to="/" className="signin-back">
            ← Back to website
          </Link>
        </SigninCard>
      </SigninFormPanel>
    </SigninPage>
  );
}
