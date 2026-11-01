import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import {
  buildDashboardModules,
  type DashboardModule,
} from '../../../data/dashboardModules';

export function useDashboardModules(refreshKey: number) {
  const [modules, setModules] = useState<DashboardModule[]>(() => buildDashboardModules(0));

  useEffect(() => {
    let active = true;

    api
      .getDocuments()
      .then(({ documents }) => {
        if (!active) return;
        setModules(buildDashboardModules(documents.length));
      })
      .catch(() => {
        if (active) setModules(buildDashboardModules(0));
      });

    return () => {
      active = false;
    };
  }, [refreshKey]);

  return { modules };
}
