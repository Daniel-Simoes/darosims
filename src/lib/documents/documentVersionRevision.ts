/** Next controlled version (e.g. 1 → 1.1, 1.1 → 1.2, 2 → 2.1). */
export function getNextDocumentVersion(current: number): number {
  const value = Number.isFinite(current) ? current : 1;
  if (Number.isInteger(value)) return Math.round((value + 0.1) * 10) / 10;
  return Math.round((value + 0.1) * 10) / 10;
}

export function formatRevisionVersionLabel(version: number): string {
  if (Number.isInteger(version)) return String(version);
  return String(version);
}

/** Prior controlled version (e.g. 1.1 → 1, 1.2 → 1.1). */
export function getPreviousDocumentVersion(current: number): number {
  const value = Number.isFinite(current) ? current : 1;
  if (value <= 1 + 0.0001) return 1;
  if (Number.isInteger(value)) return Math.max(value - 1, 1);
  return Math.round((value - 0.1) * 10) / 10;
}