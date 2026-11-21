import { useEffect, useState } from 'react';
import type { ChartPoint } from '../../../data/dashboardCharts';
import { api } from '../../../lib/api';
import { getCachedData } from '../../../lib/data/clientDataCache';
import { buildDocumentsByTypeChart } from '../../../lib/documents/documentChartData';
import { runCachedScreenLoad } from '../../../lib/ui/skeletonLoading';

const CACHE_KEY = 'home:documentsByType';

export function useDocumentsByType(refreshKey: number) {
  const cached = getCachedData<ChartPoint[]>(CACHE_KEY);
  const [data, setData] = useState<ChartPoint[]>(cached ?? []);
  const [showSkeleton, setShowSkeleton] = useState(!cached);

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        await runCachedScreenLoad({
          cacheKey: CACHE_KEY,
          fetcher: async () => {
            const { documents } = await api.getDocuments();
            return buildDocumentsByTypeChart(documents);
          },
          onData: (points) => {
            if (active) setData(points);
          },
          setShowSkeleton: (value) => {
            if (active) setShowSkeleton(value);
          },
        });
      } catch {
        if (active) {
          setData([]);
          setShowSkeleton(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [refreshKey]);

  return { data, isLoading: showSkeleton };
}