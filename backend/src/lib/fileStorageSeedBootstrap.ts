import { promises as fs } from 'fs';
import { DATA_DIR } from '@/config/paths';
import { joinPath } from '@/lib/joinPath';

const SEED_FILES = [
  'documents.json',
  'notifications.json',
  'document_events.json',
  'document_comments.json',
  'document_chat_presence.json',
  'users.json',
] as const;

/** JSON file storage on Vercel — loaded dynamically so instrumentation does not bundle `fs`. */
export async function bootstrapJsonFileStorage(): Promise<void> {
  const seedDir = joinPath(process.cwd(), 'data-seed');
  await fs.mkdir(DATA_DIR, { recursive: true });

  for (const file of SEED_FILES) {
    const dest = joinPath(DATA_DIR, file);
    try {
      await fs.access(dest);
      continue;
    } catch {
      /* missing — copy from seed bundle */
    }

    const source = joinPath(seedDir, file);
    try {
      await fs.copyFile(source, dest);
    } catch {
      await fs.writeFile(dest, '[]', 'utf-8');
    }
  }

  await fs.mkdir(joinPath(DATA_DIR, 'uploads'), { recursive: true });
  await fs.mkdir(joinPath(DATA_DIR, 'user-photos'), { recursive: true });
}
