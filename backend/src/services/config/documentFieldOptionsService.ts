import {
  DOCUMENT_FIELD_OPTION_DEFAULTS,
  type DocumentFieldOptionCategory,
} from '@/data/documentFieldDefaults';
import {
  appendFieldOptionRecord,
  readAllFieldOptions,
} from '@/repositories/config/documentFieldOptionsRepository';
import type { DocumentFieldOptionRecord } from '@/types/documentFieldOptions';

function normalizeLabel(label: string): string {
  return label.trim().replace(/\s+/g, ' ');
}

export function mergeFieldOptions(
  category: DocumentFieldOptionCategory,
  saved: string[],
  currentValue?: string,
): string[] {
  const seen = new Set<string>();
  const merged: string[] = [];
  const push = (raw: string) => {
    const value = normalizeLabel(raw);
    if (!value) return;
    const key = value.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    merged.push(value);
  };

  for (const item of DOCUMENT_FIELD_OPTION_DEFAULTS[category]) push(item);
  for (const item of saved) push(item);
  if (currentValue) push(currentValue);

  return merged.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
}

export async function listFieldOptionsByCategory(
  category: DocumentFieldOptionCategory,
): Promise<string[]> {
  try {
    const all = await readAllFieldOptions();
    const saved = all.filter((item) => item.category === category).map((item) => item.label);
    return mergeFieldOptions(category, saved);
  } catch {
    return mergeFieldOptions(category, []);
  }
}

export async function createFieldOption(
  category: DocumentFieldOptionCategory,
  label: string,
  createdBy?: string,
): Promise<{ option: DocumentFieldOptionRecord; options: string[] }> {
  const normalized = normalizeLabel(label);
  if (!normalized || normalized.length > 120) {
    throw new Error('Option label is required and must be at most 120 characters');
  }

  const all = await readAllFieldOptions();
  const exists = all.some(
    (item) => item.category === category && item.label.toLowerCase() === normalized.toLowerCase(),
  );
  if (exists) {
    return { option: all.find((item) => item.category === category && item.label.toLowerCase() === normalized.toLowerCase())!, options: await listFieldOptionsByCategory(category) };
  }

  const option: DocumentFieldOptionRecord = {
    id: crypto.randomUUID(),
    category,
    label: normalized,
    createdAt: new Date().toISOString(),
    createdBy,
  };

  await appendFieldOptionRecord(option);
  const options = await listFieldOptionsByCategory(category);
  return { option, options };
}