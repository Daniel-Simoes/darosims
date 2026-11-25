import { promises as fs } from 'fs';
import { APPROVAL_MEETINGS_FILE, DATA_DIR } from '@/config/paths';
import type { ApprovalMeetingRecord } from '@/types';

const EMPTY: ApprovalMeetingRecord[] = [];

async function ensureFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(APPROVAL_MEETINGS_FILE);
  } catch {
    await fs.writeFile(APPROVAL_MEETINGS_FILE, JSON.stringify(EMPTY, null, 2), 'utf-8');
  }
}

async function readAll(): Promise<ApprovalMeetingRecord[]> {
  await ensureFile();
  try {
    const raw = await fs.readFile(APPROVAL_MEETINGS_FILE, 'utf-8');
    return JSON.parse(raw) as ApprovalMeetingRecord[];
  } catch {
    await fs.writeFile(APPROVAL_MEETINGS_FILE, JSON.stringify(EMPTY, null, 2), 'utf-8');
    return EMPTY;
  }
}

async function writeAll(records: ApprovalMeetingRecord[]) {
  await ensureFile();
  await fs.writeFile(APPROVAL_MEETINGS_FILE, JSON.stringify(records, null, 2), 'utf-8');
}

export async function readAllApprovalMeetings(): Promise<ApprovalMeetingRecord[]> {
  return readAll();
}

export async function findApprovalMeetingById(id: string): Promise<ApprovalMeetingRecord | null> {
  const records = await readAll();
  return records.find((item) => item.id === id) ?? null;
}

export async function findApprovalMeetingsByDocumentId(
  documentId: string,
): Promise<ApprovalMeetingRecord[]> {
  const records = await readAll();
  return records.filter((item) => item.documentId === documentId);
}

export async function saveApprovalMeetingRecord(record: ApprovalMeetingRecord): Promise<void> {
  const records = await readAll();
  const index = records.findIndex((item) => item.id === record.id);
  if (index === -1) {
    records.push(record);
  } else {
    records[index] = record;
  }
  await writeAll(records);
}