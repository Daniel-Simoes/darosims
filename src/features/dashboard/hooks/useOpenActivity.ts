import { useEffect, useState } from 'react';
import type { ColoredChartPoint } from '../../../data/moduleVisualizations';
import { api } from '../../../lib/api';
import { buildOpenActivityBreakdown } from '../../../lib/documents/openActivityData';

export function useOpenActivity(refreshKey: number) {
  const [data, setData] = useState<ColoredChartPoint[]>(() => buildOpenActivityBreakdown([]));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setIsLoading(true);

    api
      .getDocuments()
      .then(({ documents }) => {
        if (!active) return;
        setData(buildOpenActivityBreakdown(documents));
      })
      .catch(() => {
        if (active) setData(buildOpenActivityBreakdown([]));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [refreshKey]);

  return { data, isLoading };
}