const memory = new Map<string, unknown>();

export function getCachedData<T>(key: string): T | null {
  if (!memory.has(key)) return null;
  return memory.get(key) as T;
}

export function setCachedData<T>(key: string, value: T): void {
  memory.set(key, value);
}

export function invalidateCachedData(key: string): void {
  memory.delete(key);
}

export function clearClientDataCache(): void {
  memory.clear();
}