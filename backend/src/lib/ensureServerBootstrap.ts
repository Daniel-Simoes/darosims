let bootstrapPromise: Promise<void> | null = null;

export function ensureServerBootstrap(): Promise<void> {
  if (!bootstrapPromise) {
    bootstrapPromise = import('@/lib/serverBootstrap')
      .then((m) => m.runServerBootstrap())
      .catch((err) => {
        bootstrapPromise = null;
        throw err;
      });
  }
  return bootstrapPromise;
}
