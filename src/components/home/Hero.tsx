import {
  Hero as HeroRoot,
  HeroActions,
  HeroBadge,
  HeroContent,
  HeroDescription,
  HeroFloatCard,
  HeroFloatIcon,
  HeroImageFrame,
  HeroStatLabel,
  HeroStatValue,
  HeroStats,
  HeroTitle,
  HeroVisual,
} from './Hero.styles';
import { Link } from 'react-router-dom';
import { brand } from '../../data/brand';
import { images } from '../../data/images';

export function Hero() {
  return (
    <HeroRoot>
      <div className="container hero-grid">
        <HeroContent>
          <HeroBadge>
            <span className="hero-badge-dot" />
            Integrated Management System Platform
          </HeroBadge>

          <HeroTitle>
            Simplify compliance.<br />
            <span>Accelerate improvement.</span>
          </HeroTitle>

          <HeroDescription>{brand.mission}</HeroDescription>

          <HeroActions>
            <a href="#demo" className="btn btn-primary">
              Request a Demo
            </a>
            <Link to="/signin" className="btn btn-dark">
              Sign In to Dashboard
            </Link>
          </HeroActions>

          <HeroStats>
            <div>
              <HeroStatValue>4</HeroStatValue>
              <HeroStatLabel>ISO Standards Supported</HeroStatLabel>
            </div>
            <div>
              <HeroStatValue>8+</HeroStatValue>
              <HeroStatLabel>Integrated Modules</HeroStatLabel>
            </div>
            <div>
              <HeroStatValue>IE & UK</HeroStatValue>
              <HeroStatLabel>Target Market</HeroStatLabel>
            </div>
          </HeroStats>
        </HeroContent>

        <HeroVisual>
          <HeroImageFrame>
            <img
              src={images.heroDashboard}
              alt="Daros compliance dashboard preview"
              className="hero-image"
            />
            <HeroFloatCard>
              <HeroFloatIcon>✓</HeroFloatIcon>
              <div>
                <strong>87%</strong>
                <span>Compliance Score</span>
              </div>
            </HeroFloatCard>
            <HeroFloatCard>
              <HeroFloatIcon>📊</HeroFloatIcon>
              <div>
                <strong>32 KPIs</strong>
                <span>Tracked live</span>
              </div>
            </HeroFloatCard>
          </HeroImageFrame>
        </HeroVisual>
      </div>
    </HeroRoot>
  );
}
