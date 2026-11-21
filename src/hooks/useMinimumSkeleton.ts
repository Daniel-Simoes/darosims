import { useEffect, useRef, useState } from 'react';
import { SKELETON_MIN_MS } from '../lib/ui/skeletonLoading';

/** Keeps skeleton visible at least `minMs` once loading started (cold load UX). */
export function useMinimumSkeleton(active: boolean, minMs: number = SKELETON_MIN_MS): boolean {
  const [visible, setVisible] = useState(active);
  const startedAt = useRef<number | null>(null);

  useEffect(() => {
    if (active) {
      startedAt.current = Date.now();
      setVisible(true);
      return undefined;
    }

    if (startedAt.current === null) {
      setVisible(false);
      return undefined;
    }

    const elapsed = Date.now() - startedAt.current;
    const wait = minMs - elapsed;
    if (wait <= 0) {
      setVisible(false);
      startedAt.current = null;
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setVisible(false);
      startedAt.current = null;
    }, wait);
    return () => window.clearTimeout(timer);
  }, [active, minMs]);

  return visible;
}