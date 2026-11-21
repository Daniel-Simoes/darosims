import { promises as fs } from 'fs';
import { DATA_DIR } from '@/config/paths';
import { joinPath } from '@/lib/joinPath';
import { createNotification } from '@/lib/notifications';

const FILE_NAME = 'lgpd_requests.json';

export type LgpdRequestRecord = {
  id: string;
  name: string;
  email: string;
  requestType: string;
  message?: string;
  createdAt: string;
};

async function ensureFile(): Promise<LgpdRequestRecord[]> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const filePath = joinPath(DATA_DIR, FILE_NAME);
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw) as LgpdRequestRecord[];
  } catch {
    await fs.writeFile(filePath, '[]', 'utf-8');
    return [];
  }
}

export async function appendLgpdRequest(
  input: Omit<LgpdRequestRecord, 'id' | 'createdAt'>,
): Promise<LgpdRequestRecord> {
  const record: LgpdRequestRecord = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  const list = await ensureFile();
  list.push(record);
  await fs.writeFile(joinPath(DATA_DIR, FILE_NAME), JSON.stringify(list, null, 2), 'utf-8');

  const dpo =
    process.env.LGPD_DPO_EMAIL?.trim() ||
    process.env.ADMIN_EMAIL?.trim() ||
    'privacidade@daros.com';

  await createNotification({
    recipientEmail: dpo,
    documentId: 'legal-lgpd',
    type: 'lgpd_request',
    title: 'New data subject request',
    message: `${input.name} (${input.email}) — ${input.requestType}${input.message ? `: ${input.message}` : ''}`,
    actorName: input.name,
  });

  return record;
}