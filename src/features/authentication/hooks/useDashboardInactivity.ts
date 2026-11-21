import { useEffect, useRef } from 'react';

/** Time without input before the session is locked (ms). */
export const DASHBOARD_INACTIVITY_MS = 20 * 60 * 1000;

const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'] as const;
const CHECK_INTERVAL_MS = 15_000;
const MOUSEMOVE_THROTTLE_MS = 1_000;

export function useDashboardInactivity(enabled: boolean, onInactive: () => void) {
  const lastActivityRef = useRef(Date.now());
  const onInactiveRef = useRef(onInactive);

  useEffect(() => {
    onInactiveRef.current = onInactive;
  }, [onInactive]);

  useEffect(() => {
    if (!enabled) return;

    lastActivityRef.current = Date.now();
    let lastMouseMoveAt = 0;

    function touchActivity() {
      lastActivityRef.current = Date.now();
    }

    function onMouseMove() {
      const now = Date.now();
      if (now - lastMouseMoveAt < MOUSEMOVE_THROTTLE_MS) return;
      lastMouseMoveAt = now;
      touchActivity();
    }

    function checkIdle() {
      if (Date.now() - lastActivityRef.current >= DASHBOARD_INACTIVITY_MS) {
        onInactiveRef.current();
      }
    }

    for (const eventName of ACTIVITY_EVENTS) {
      window.addEventListener(eventName, touchActivity, { passive: true });
    }
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('visibilitychange', checkIdle);

    const intervalId = window.setInterval(checkIdle, CHECK_INTERVAL_MS);

    return () => {
      for (const eventName of ACTIVITY_EVENTS) {
        window.removeEventListener(eventName, touchActivity);
      }
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('visibilitychange', checkIdle);
      window.clearInterval(intervalId);
    };
  }, [enabled]);
}