export const STANDARD_OPTION = 'Standard';

export function sortOptionsAlphabetically(options: string[]): string[] {
  return [...options].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
}

/** Merge base + extra values, dedupe case-insensitively, sort A–Z. Keeps `currentValue` if set. */
export function buildSelectOptions(
  base: readonly string[],
  extras: string[],
  currentValue?: string,
  includeStandard = true,
): string[] {
  const seen = new Set<string>();
  const merged: string[] = [];

  const baseList = includeStandard
    ? [STANDARD_OPTION, ...base.filter((item) => item !== STANDARD_OPTION)]
    : [...base];

  for (const raw of [...baseList, ...extras]) {
    const label = raw.trim();
    if (!label) continue;
    const key = label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(label);
  }

  const current = currentValue?.trim();
  if (current) {
    const key = current.toLowerCase();
    if (!seen.has(key)) {
      merged.push(current);
    }
  }

  return sortOptionsAlphabetically(merged);
}
