import type { ReactNode } from 'react';
import { CookieConsent } from '../legal/CookieConsent';
import { SkipToContent } from '../legal/SkipToContent';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export function PublicSiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SkipToContent />
      <CookieConsent />
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </>
  );
}