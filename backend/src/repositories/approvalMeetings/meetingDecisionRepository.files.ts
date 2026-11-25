import { promises as fs } from 'fs';
import { DATA_DIR, MEETING_DECISIONS_FILE } from '@/config/paths';
import type { MeetingDecisionRecord } from '@/types';

const EMPTY: MeetingDecisionRecord[] = [];

async function ensureFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(MEETING_DECISIONS_FILE);
  } catch {
    await fs.writeFile(MEETING_DECISIONS_FILE, JSON.stringify(EMPTY, null, 2), 'utf-8');
  }
}

async function readAll(): Promise<MeetingDecisionRecord[]> {
  await ensureFile();
  try {
    const raw = await fs.readFile(MEETING_DECISIONS_FILE, 'utf-8');
    return JSON.parse(raw) as MeetingDecisionRecord[];
  } catch {
    await fs.writeFile(MEETING_DECISIONS_FILE, JSON.stringify(EMPTY, null, 2), 'utf-8');
    return EMPTY;
  }
}

async function writeAll(records: MeetingDecisionRecord[]) {
  await ensureFile();
  await fs.writeFile(MEETING_DECISIONS_FILE, JSON.stringify(records, null, 2), 'utf-8');
}

export async function findMeetingDecisionByMeetingId(
  meetingId: string,
): Promise<MeetingDecisionRecord | null> {
  const records = await readAll();
  return records.find((item) => item.meetingId === meetingId) ?? null;
}

export async function findMeetingDecisionsByDocumentId(
  documentId: string,
): Promise<MeetingDecisionRecord[]> {
  const records = await readAll();
  return records.filter((item) => item.documentId === documentId);
}

export async function saveMeetingDecisionRecord(record: MeetingDecisionRecord): Promise<void> {
  const records = await readAll();
  const index = records.findIndex((item) => item.id === record.id);
  if (index === -1) {
    records.push(record);
  } else {
    records[index] = record;
  }
  await writeAll(records);
}

export async function transitionMeetingDecisionRecord(
  meetingId: string,
  expectedStatus: MeetingDecisionRecord['status'],
  apply: (current: MeetingDecisionRecord) => MeetingDecisionRecord,
): Promise<MeetingDecisionRecord> {
  const records = await readAll();
  const index = records.findIndex((item) => item.meetingId === meetingId);
  if (index === -1) {
    throw new Error('Meeting decision not found');
  }
  const current = records[index];
  if (current.status !== expectedStatus) {
    throw new Error(`Meeting decision is already ${current.status}`);
  }
  const now = new Date().toISOString();
  const next = { ...apply(current), updatedAt: now };
  records[index] = next;
  await writeAll(records);
  return next;
}