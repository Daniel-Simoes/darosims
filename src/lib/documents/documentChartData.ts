import type { ChartPoint } from '../../data/dashboardCharts';
import type { DocumentRecord } from '../../types/documents';

export function buildDocumentsByTypeChart(
  documents: Pick<DocumentRecord, 'type'>[],
): ChartPoint[] {
  const counts = new Map<string, number>();

  for (const document of documents) {
    const type = document.type?.trim() || 'Unspecified';
    counts.set(type, (counts.get(type) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));
}