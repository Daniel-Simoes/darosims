export function getNextDocumentVersion(current: number): number {
  const value = Number.isFinite(current) ? current : 1;
  if (Number.isInteger(value)) return Math.round((value + 0.1) * 10) / 10;
  return Math.round((value + 0.1) * 10) / 10;
}

export function isValidRevisionTargetVersion(current: number, next: number): boolean {
  if (!Number.isFinite(next)) return false;
  return next > current + 0.0001;
}