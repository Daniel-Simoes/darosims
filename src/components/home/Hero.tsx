import { HandheldAuthLink } from '../auth/HandheldAuthLink';
import { brand } from '../../data/brand';
import { images } from '../../data/images';
import { imageCredits } from '../../data/imageCredits';
import './Hero.css';

const heroImage = imageCredits.find((entry) => entry.id === 'hero-dashboard');

export function Hero() {
  return (
    <section className="hero">
      <div className="container hero-grid">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            Integrated Management System Platform
          </div>

          <h1 className="hero-title">
            Simplify compliance.<br />
            <span>Accelerate improvement.</span>
          </h1>

          <p className="hero-description">{brand.mission}</p>

          <div className="hero-actions">
            <a href="#demo" className="btn btn-primary">
              Request a Demo
            </a>
            <HandheldAuthLink className="btn btn-dark">Sign In to Dashboard</HandheldAuthLink>
          </div>

          <div className="hero-stats">
            <div>
              <div className="hero-stat-value">4</div>
              <div className="hero-stat-label">ISO Standards Supported</div>
            </div>
            <div>
              <div className="hero-stat-value">8+</div>
              <div className="hero-stat-label">Integrated Modules</div>
            </div>
            <div>
              <div className="hero-stat-value">IE & UK</div>
              <div className="hero-stat-label">Target Market</div>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-image-frame">
            <img
              src={images.heroDashboard}
              alt={heroImage?.alt ?? 'Illustrative Daros dashboard preview'}
              title={heroImage?.copyright}
              className="hero-image"
            />
            <p className="hero-image-caption" role="note">
              Demonstration illustration — not actual customer results.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
