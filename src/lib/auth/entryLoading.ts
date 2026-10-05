export const ENTRY_LOADING_MIN_MS = 3000;

export async function waitForEntryLoading(startedAt: number) {
  const elapsed = Date.now() - startedAt;
  if (elapsed < ENTRY_LOADING_MIN_MS) {
    await new Promise((resolve) => window.setTimeout(resolve, ENTRY_LOADING_MIN_MS - elapsed));
  }
}
