import {
  DOCUMENT_FIELD_OPTION_DEFAULTS,
  type DocumentFieldOptionCategory,
} from '@/data/documentFieldDefaults';
import {
  appendFieldOptionRecord,
  readAllFieldOptions,
} from '@/repositories/config/documentFieldOptionsRepository';
import { readAllDocuments } from '@/repositories/documents/documentRepository';
import { isMissingTableError } from '@/lib/supabaseSchemaCheck';
import type { DocumentFieldOptionRecord } from '@/types/documentFieldOptions';
import { collectDocumentFieldValues } from '@/services/config/documentFieldValuesFromDocuments';

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

async function readSavedFieldOptionLabels(): Promise<DocumentFieldOptionRecord[]> {
  try {
    return await readAllFieldOptions();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (isMissingTableError(message)) return [];
    throw err;
  }
}

async function gatherSavedAndDocumentValues(
  category: DocumentFieldOptionCategory,
  extra?: string,
): Promise<string[]> {
  const documents = await readAllDocuments();
  const fromDocs = collectDocumentFieldValues(category, documents);
  const all = await readSavedFieldOptionLabels();
  const fromTable = all.filter((item) => item.category === category).map((item) => item.label);
  return mergeFieldOptions(category, [...fromTable, ...fromDocs], extra);
}

export async function listFieldOptionsByCategory(
  category: DocumentFieldOptionCategory,
): Promise<string[]> {
  return gatherSavedAndDocumentValues(category);
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

  const option: DocumentFieldOptionRecord = {
    id: crypto.randomUUID(),
    category,
    label: normalized,
    createdAt: new Date().toISOString(),
    createdBy,
  };

  try {
    const all = await readAllFieldOptions();
    const exists = all.some(
      (item) => item.category === category && item.label.toLowerCase() === normalized.toLowerCase(),
    );
    if (!exists) {
      await appendFieldOptionRecord(option);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (!isMissingTableError(message)) {
      throw err;
    }
  }

  const options = await gatherSavedAndDocumentValues(category, normalized);
  return { option, options };
}