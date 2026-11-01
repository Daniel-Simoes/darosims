import { promises as fs } from 'fs';
import { DATA_DIR, DOCUMENT_COMMENTS_FILE } from '@/config/paths';
import type { DocumentCommentMessage } from '@/types';

const EMPTY: DocumentCommentMessage[] = [];

async function ensureDataFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DOCUMENT_COMMENTS_FILE);
  } catch {
    await fs.writeFile(DOCUMENT_COMMENTS_FILE, JSON.stringify(EMPTY, null, 2), 'utf-8');
  }
}

export async function readAllDocumentComments(): Promise<DocumentCommentMessage[]> {
  await ensureDataFile();
  try {
    const raw = await fs.readFile(DOCUMENT_COMMENTS_FILE, 'utf-8');
    return JSON.parse(raw) as DocumentCommentMessage[];
  } catch {
    await fs.writeFile(DOCUMENT_COMMENTS_FILE, JSON.stringify(EMPTY, null, 2), 'utf-8');
    return EMPTY;
  }
}

export async function appendDocumentComment(
  message: DocumentCommentMessage,
): Promise<DocumentCommentMessage> {
  const comments = await readAllDocumentComments();
  comments.push(message);
  await fs.writeFile(DOCUMENT_COMMENTS_FILE, JSON.stringify(comments, null, 2), 'utf-8');
  return message;
}
