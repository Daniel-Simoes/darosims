import { Link } from 'react-router-dom';
import { brand } from '../../data/brand';
import { images } from '../../data/images';
import './Hero.css';

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
            <Link to="/signin" className="btn btn-dark">
              Sign In to Dashboard
            </Link>
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
              alt="Daros compliance dashboard preview"
              className="hero-image"
            />
            <div className="hero-float-card hero-float-card--top">
              <span className="hero-float-icon">✓</span>
              <div>
                <strong>87%</strong>
                <span>Compliance Score</span>
              </div>
            </div>
            <div className="hero-float-card hero-float-card--bottom">
              <span className="hero-float-icon">📊</span>
              <div>
                <strong>32 KPIs</strong>
                <span>Tracked live</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
