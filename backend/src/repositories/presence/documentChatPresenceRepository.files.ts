import { promises as fs } from 'fs';
import { DATA_DIR, DOCUMENT_CHAT_PRESENCE_FILE } from '@/config/paths';
import type { DocumentChatPresenceRecord } from '@/types';

const EMPTY: DocumentChatPresenceRecord[] = [];

async function ensureDataFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DOCUMENT_CHAT_PRESENCE_FILE);
  } catch {
    await fs.writeFile(DOCUMENT_CHAT_PRESENCE_FILE, JSON.stringify(EMPTY, null, 2), 'utf-8');
  }
}

export async function readAllChatPresence(): Promise<DocumentChatPresenceRecord[]> {
  await ensureDataFile();
  try {
    const raw = await fs.readFile(DOCUMENT_CHAT_PRESENCE_FILE, 'utf-8');
    return JSON.parse(raw) as DocumentChatPresenceRecord[];
  } catch {
    await fs.writeFile(DOCUMENT_CHAT_PRESENCE_FILE, JSON.stringify(EMPTY, null, 2), 'utf-8');
    return EMPTY;
  }
}

export async function upsertChatPresence(record: DocumentChatPresenceRecord): Promise<void> {
  const all = await readAllChatPresence();
  const index = all.findIndex((item) => item.id === record.id);
  if (index === -1) {
    all.push(record);
  } else {
    all[index] = record;
  }
  await fs.writeFile(DOCUMENT_CHAT_PRESENCE_FILE, JSON.stringify(all, null, 2), 'utf-8');
}
