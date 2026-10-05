import { Navigate, useParams } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { MarketingPageLayout } from '../../components/marketing/MarketingPageLayout';
import { getMarketingPage, isMarketingCategory } from '../../data/marketingPages';

export function MarketingSubPage() {
  const { category, slug } = useParams<{ category: string; slug: string }>();

  if (!category || !isMarketingCategory(category)) {
    return <Navigate to="/" replace />;
  }

  const page = getMarketingPage(category, slug);

  if (!page) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <Navbar />
      <main>
        <MarketingPageLayout page={page} />
      </main>
      <Footer />
    </>
  );
}
