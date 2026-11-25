import { promises as fs } from 'fs';
import { DOCUMENT_FIELD_OPTIONS_FILE, DATA_DIR } from '@/config/paths';
import type { DocumentFieldOptionRecord } from '@/types/documentFieldOptions';

async function ensureOptionsFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DOCUMENT_FIELD_OPTIONS_FILE);
  } catch {
    await fs.writeFile(DOCUMENT_FIELD_OPTIONS_FILE, '[]', 'utf-8');
  }
}

export async function readAllFieldOptions(): Promise<DocumentFieldOptionRecord[]> {
  await ensureOptionsFile();
  try {
    const raw = await fs.readFile(DOCUMENT_FIELD_OPTIONS_FILE, 'utf-8');
    return JSON.parse(raw) as DocumentFieldOptionRecord[];
  } catch {
    await fs.writeFile(DOCUMENT_FIELD_OPTIONS_FILE, '[]', 'utf-8');
    return [];
  }
}

export async function writeAllFieldOptions(options: DocumentFieldOptionRecord[]): Promise<void> {
  await ensureOptionsFile();
  await fs.writeFile(DOCUMENT_FIELD_OPTIONS_FILE, JSON.stringify(options, null, 2), 'utf-8');
}

export async function appendFieldOptionRecord(
  record: DocumentFieldOptionRecord,
): Promise<DocumentFieldOptionRecord> {
  const all = await readAllFieldOptions();
  all.push(record);
  await writeAllFieldOptions(all);
  return record;
}