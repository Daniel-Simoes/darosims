import { promises as fs } from 'fs';
import { DOCUMENTS_FILE, DATA_DIR } from '@/config/paths';
import type { DocumentRecord } from '@/types';

const EMPTY_DOCUMENTS: DocumentRecord[] = [];

async function ensureDataFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DOCUMENTS_FILE);
  } catch {
    await fs.writeFile(DOCUMENTS_FILE, JSON.stringify(EMPTY_DOCUMENTS, null, 2), 'utf-8');
  }
}

export async function readAllDocuments(): Promise<DocumentRecord[]> {
  await ensureDataFile();
  try {
    const raw = await fs.readFile(DOCUMENTS_FILE, 'utf-8');
    return JSON.parse(raw) as DocumentRecord[];
  } catch {
    await fs.writeFile(DOCUMENTS_FILE, JSON.stringify(EMPTY_DOCUMENTS, null, 2), 'utf-8');
    return EMPTY_DOCUMENTS;
  }
}

export async function writeAllDocuments(documents: DocumentRecord[]): Promise<void> {
  await ensureDataFile();
  await fs.writeFile(DOCUMENTS_FILE, JSON.stringify(documents, null, 2), 'utf-8');
}

export async function findDocumentById(id: string): Promise<DocumentRecord | null> {
  const documents = await readAllDocuments();
  return documents.find((item) => item.id === id) ?? null;
}

export async function saveDocumentRecord(document: DocumentRecord): Promise<void> {
  const documents = await readAllDocuments();
  const index = documents.findIndex((item) => item.id === document.id);
  if (index === -1) {
    documents.push(document);
  } else {
    documents[index] = document;
  }
  await writeAllDocuments(documents);
}

export async function removeDocumentRecord(id: string): Promise<boolean> {
  const documents = await readAllDocuments();
  const index = documents.findIndex((item) => item.id === id);
  if (index === -1) return false;
  documents.splice(index, 1);
  await writeAllDocuments(documents);
  return true;
}
