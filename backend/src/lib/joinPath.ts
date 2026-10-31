/** Small path.join for server data dirs (avoids `path` in Next instrumentation bundles). */
export function joinPath(...segments: string[]): string {
  if (segments.length === 0) return '.';
  const filtered = segments.filter((s) => s.length > 0);
  const absolute = filtered[0]?.startsWith('/');
  const joined = filtered
    .map((segment, index) => (index === 0 ? segment.replace(/\/+$/, '') : segment.replace(/^\/+|\/+$/g, '')))
    .join('/');
  const normalized = joined.replace(/\/+/g, '/');
  if (absolute && !normalized.startsWith('/')) {
    return `/${normalized}`;
  }
  return normalized || '.';
}
