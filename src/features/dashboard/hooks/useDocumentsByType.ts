import { useEffect, useState } from 'react';
import type { ChartPoint } from '../../../data/dashboardCharts';
import { api } from '../../../lib/api';
import { buildDocumentsByTypeChart } from '../../../lib/documents/documentChartData';

export function useDocumentsByType(refreshKey: number) {
  const [data, setData] = useState<ChartPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setIsLoading(true);

    api
      .getDocuments()
      .then(({ documents }) => {
        if (!active) return;
        setData(buildDocumentsByTypeChart(documents));
      })
      .catch(() => {
        if (active) setData([]);
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