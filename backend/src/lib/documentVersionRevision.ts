export function getNextDocumentVersion(current: number): number {
  const value = Number.isFinite(current) ? current : 1;
  if (Number.isInteger(value)) return Math.round((value + 0.1) * 10) / 10;
  return Math.round((value + 0.1) * 10) / 10;
}

export function isValidRevisionTargetVersion(current: number, next: number): boolean {
  if (!Number.isFinite(next)) return false;
  return next > current + 0.0001;
}

/** Prior controlled version (e.g. 1.1 → 1, 1.2 → 1.1). */
export function getPreviousDocumentVersion(current: number): number {
  const value = Number.isFinite(current) ? current : 1;
  if (value <= 1 + 0.0001) return 1;
  if (Number.isInteger(value)) return Math.max(value - 1, 1);
  return Math.round((value - 0.1) * 10) / 10;
}