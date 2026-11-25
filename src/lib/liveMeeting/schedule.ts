/** Combine HTML date + time (local) into ISO UTC. */
export function combineLocalDateAndTime(date: string, time: string): string {
  const trimmedDate = date.trim();
  const trimmedTime = time.trim();
  if (!trimmedDate || !trimmedTime) {
    throw new Error('Meeting date and time are required');
  }
  const local = new Date(`${trimmedDate}T${trimmedTime}`);
  if (Number.isNaN(local.getTime())) {
    throw new Error('Invalid meeting date or time');
  }
  if (local.getTime() < Date.now() - 60_000) {
    throw new Error('Meeting must be scheduled in the future');
  }
  return local.toISOString();
}

export function browserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}