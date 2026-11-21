import { getCachedData, setCachedData } from '../data/clientDataCache';

export const SKELETON_MIN_MS = 1500;

export async function ensureMinSkeletonDuration(startedAt: number): Promise<void> {
  const wait = SKELETON_MIN_MS - (Date.now() - startedAt);
  if (wait > 0) {
    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, wait);
    });
  }
}

/** Fetch with in-memory cache: skeleton only on first cold load (min 1.5s). */
export async function runCachedScreenLoad<T>({
  cacheKey,
  fetcher,
  onData,
  setShowSkeleton,
}: {
  cacheKey: string;
  fetcher: () => Promise<T>;
  onData: (data: T) => void;
  setShowSkeleton: (show: boolean) => void;
}): Promise<T> {
  const cached = getCachedData<T>(cacheKey);
  if (cached) {
    onData(cached);
    setShowSkeleton(false);
  }

  const useSkeleton = !cached;
  if (useSkeleton) setShowSkeleton(true);
  const started = Date.now();

  const fresh = await fetcher();
  setCachedData(cacheKey, fresh);
  onData(fresh);

  if (useSkeleton) {
    await ensureMinSkeletonDuration(started);
    setShowSkeleton(false);
  }

  return fresh;
}