import { useEffect, useState } from 'react';
import type { ColoredChartPoint } from '../../../data/moduleVisualizations';
import { api } from '../../../lib/api';
import { getCachedData } from '../../../lib/data/clientDataCache';
import { buildOpenActivityBreakdown } from '../../../lib/documents/openActivityData';
import { runCachedScreenLoad } from '../../../lib/ui/skeletonLoading';

const CACHE_KEY = 'home:openActivity';

export function useOpenActivity(refreshKey: number) {
  const cached = getCachedData<ColoredChartPoint[]>(CACHE_KEY);
  const [data, setData] = useState<ColoredChartPoint[]>(cached ?? []);
  const [showSkeleton, setShowSkeleton] = useState(!cached);

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        await runCachedScreenLoad({
          cacheKey: CACHE_KEY,
          fetcher: async () => {
            const { documents } = await api.getDocuments();
            return buildOpenActivityBreakdown(documents);
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