const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 200;

export function parseListLimit(searchParams: URLSearchParams): number {
  const raw = searchParams.get('limit');
  if (!raw) return DEFAULT_LIMIT;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return DEFAULT_LIMIT;
  return Math.min(parsed, MAX_LIMIT);
}

export function slicePage<T>(items: T[], limit: number, offset = 0): T[] {
  return items.slice(offset, offset + limit);
}