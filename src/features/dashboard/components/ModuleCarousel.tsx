import { useCallback, useEffect, useRef, useState } from 'react';
import type { DashboardModule } from '../../../data/dashboardModules';
import './ModuleCarousel.css';

interface ModuleCarouselProps {
  modules: DashboardModule[];
  onModuleClick: (moduleId: string) => void;
}

function getCategoryAccent(category: DashboardModule['category']) {
  switch (category) {
    case 'compliance':
      return 'accent-compliance';
    case 'analytics':
      return 'accent-analytics';
    default:
      return 'accent-core';
  }
}

export function ModuleCarousel({ modules, onModuleClick }: ModuleCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);
  const [activePage, setActivePage] = useState(0);
  const [pageCount, setPageCount] = useState(1);

  const updateScrollState = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const { scrollLeft, scrollWidth, clientWidth } = track;
    const maxScroll = Math.max(0, scrollWidth - clientWidth - 1);
    setCanScrollPrev(scrollLeft > 4);
    setCanScrollNext(scrollLeft < maxScroll);

    const pages = Math.max(1, Math.ceil(scrollWidth / clientWidth));
    setPageCount(pages);
    setActivePage(Math.min(pages - 1, Math.round((scrollLeft / Math.max(maxScroll, 1)) * (pages - 1))));
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    updateScrollState();
    track.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);

    return () => {
      track.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [modules.length, updateScrollState]);

  function scrollByDirection(direction: 'prev' | 'next') {
    const track = trackRef.current;
    if (!track) return;

    const card = track.querySelector<HTMLElement>('.module-carousel-card');
    const cardWidth = card?.offsetWidth ?? 300;
    const gap = 16;
    const delta = direction === 'next' ? cardWidth + gap : -(cardWidth + gap);

    track.scrollBy({ left: delta, behavior: 'smooth' });
  }

  function scrollToPage(page: number) {
    const track = trackRef.current;
    if (!track) return;
    const pageWidth = track.clientWidth;
    track.scrollTo({ left: page * pageWidth, behavior: 'smooth' });
  }

  return (
    <section className="module-carousel" aria-label="IMS modules">
      <div className="module-carousel-header">
        <div>
          <p className="module-carousel-eyebrow">Platform modules</p>
          <h2 className="module-carousel-title">Manage your organisation in one place</h2>
        </div>
        <div className="module-carousel-nav">
          <button
            type="button"
            className="module-carousel-arrow"
            aria-label="Previous modules"
            disabled={!canScrollPrev}
            onClick={() => scrollByDirection('prev')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            className="module-carousel-arrow"
            aria-label="Next modules"
            disabled={!canScrollNext}
            onClick={() => scrollByDirection('next')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      <div className="module-carousel-viewport">
        <div className="module-carousel-fade module-carousel-fade-left" aria-hidden="true" />
        <div className="module-carousel-fade module-carousel-fade-right" aria-hidden="true" />
        <div ref={trackRef} className="module-carousel-track">
          {modules.map((module) => (
            <button
              key={module.id}
              type="button"
              className={`module-carousel-card ${getCategoryAccent(module.category)}`}
              onClick={() => onModuleClick(module.id)}
            >
              <div className="module-carousel-card-glow" aria-hidden="true" />
              <div className="module-carousel-card-top">
                <span className="module-carousel-icon">{module.icon}</span>
                {module.count !== undefined && (
                  <span
                    className={`module-carousel-count ${module.status === 'warning' ? 'warning' : ''}`}
                  >
                    {module.count}
                  </span>
                )}
              </div>
              <h3 className="module-carousel-card-title">{module.title}</h3>
              <p className="module-carousel-card-desc">{module.description}</p>
              <span className="module-carousel-card-cta">Open module →</span>
            </button>
          ))}
        </div>
      </div>

      <div className="module-carousel-dots" role="tablist" aria-label="Carousel pages">
        {Array.from({ length: pageCount }, (_, index) => (
          <button
            key={index}
            type="button"
            role="tab"
            aria-selected={activePage === index}
            aria-label={`Go to page ${index + 1}`}
            className={`module-carousel-dot ${activePage === index ? 'active' : ''}`}
            onClick={() => scrollToPage(index)}
          />
        ))}
      </div>
    </section>
  );
}
