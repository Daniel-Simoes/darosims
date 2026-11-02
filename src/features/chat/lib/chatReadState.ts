const STORAGE_KEY = 'daros_chat_last_read';

type ReadMap = Record<string, string>;

function loadMap(): ReadMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as ReadMap;
  } catch {
    return {};
  }
}

function saveMap(map: ReadMap) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export function markChatRead(documentId: string, atIso?: string) {
  const map = loadMap();
  map[documentId] = atIso ?? new Date().toISOString();
  saveMap(map);
}

export function getChatLastRead(documentId: string): string | null {
  return loadMap()[documentId] ?? null;
}

export function clearChatRead(documentId: string) {
  const map = loadMap();
  delete map[documentId];
  saveMap(map);
}
