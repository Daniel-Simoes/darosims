/** Whole-number versions only (1, 2, 3, …). Legacy decimals map to their major step. */
export function normalizeDocumentVersion(current: number): number {
  const value = Number.isFinite(current) ? current : 1;
  return Math.max(1, Math.floor(value));
}

/** Next controlled version (e.g. 1 → 2, 2 → 3). */
export function getNextDocumentVersion(current: number): number {
  return normalizeDocumentVersion(current) + 1;
}

export function isValidRevisionTargetVersion(current: number, next: number): boolean {
  if (!Number.isFinite(next) || !Number.isInteger(next)) return false;
  return next === getNextDocumentVersion(current);
}

export function getPreviousDocumentVersion(current: number): number {
  return Math.max(1, normalizeDocumentVersion(current) - 1);
}