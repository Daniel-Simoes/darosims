const DEFAULT_MIN_MS = 700;

export async function runWithMinDuration<T>(
  task: () => Promise<T>,
  minMs: number = DEFAULT_MIN_MS,
): Promise<T> {
  const started = Date.now();
  try {
    return await task();
  } finally {
    const elapsed = Date.now() - started;
    const wait = minMs - elapsed;
    if (wait > 0) {
      await new Promise((resolve) => window.setTimeout(resolve, wait));
    }
  }
}