import { promises as fs } from 'fs';
import path from 'path';
import { DATA_DIR } from '@/config/paths';
import { isSupabaseDatabase } from '@/database/provider';
import { ensureDefaultSeedUsers } from '@/lib/seedUsers';
import { ensureDefaultAdminFromEnv } from '@/repositories/users/userRepository';

const SEED_FILES = ['documents.json', 'notifications.json', 'document_events.json', 'users.json'] as const;

async function copySeedIfMissing() {
  const seedDir = path.join(process.cwd(), 'data-seed');
  await fs.mkdir(DATA_DIR, { recursive: true });

  for (const file of SEED_FILES) {
    const dest = path.join(DATA_DIR, file);
    try {
      await fs.access(dest);
      continue;
    } catch {
      /* missing — copy from seed bundle */
    }

    const source = path.join(seedDir, file);
    try {
      await fs.copyFile(source, dest);
    } catch {
      await fs.writeFile(dest, '[]', 'utf-8');
    }
  }

  await fs.mkdir(path.join(DATA_DIR, 'uploads'), { recursive: true });
  await fs.mkdir(path.join(DATA_DIR, 'user-photos'), { recursive: true });
}

export async function bootstrapProductionStorage() {
  if (process.env.VERCEL !== '1' && process.env.NODE_ENV !== 'production') {
    return;
  }

  if (isSupabaseDatabase()) {
    await ensureDefaultSeedUsers();
    await ensureDefaultAdminFromEnv();
    return;
  }

  await copySeedIfMissing();
  await ensureDefaultSeedUsers();
  await ensureDefaultAdminFromEnv();
}
