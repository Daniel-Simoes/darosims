import { promises as fs } from 'fs';
import { DOCUMENT_ARCHIVES_FILE, DATA_DIR } from '@/config/paths';
import type { DocumentArchiveRecord } from '@/types/documentArchive';

const EMPTY: DocumentArchiveRecord[] = [];

async function ensureFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DOCUMENT_ARCHIVES_FILE);
  } catch {
    await fs.writeFile(DOCUMENT_ARCHIVES_FILE, JSON.stringify(EMPTY, null, 2), 'utf-8');
  }
}

export async function readAllArchives(): Promise<DocumentArchiveRecord[]> {
  await ensureFile();
  try {
    const raw = await fs.readFile(DOCUMENT_ARCHIVES_FILE, 'utf-8');
    return JSON.parse(raw) as DocumentArchiveRecord[];
  } catch {
    return [];
  }
}

export async function writeAllArchives(records: DocumentArchiveRecord[]): Promise<void> {
  await ensureFile();
  await fs.writeFile(DOCUMENT_ARCHIVES_FILE, JSON.stringify(records, null, 2), 'utf-8');
}

export async function findArchiveById(id: string): Promise<DocumentArchiveRecord | null> {
  const all = await readAllArchives();
  return all.find((item) => item.id === id) ?? null;
}