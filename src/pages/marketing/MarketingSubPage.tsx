import { Navigate, useParams } from 'react-router-dom';
import { PublicSiteLayout } from '../../components/layout/PublicSiteLayout';
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
    <PublicSiteLayout>
      <MarketingPageLayout page={page} />
    </PublicSiteLayout>
  );
}