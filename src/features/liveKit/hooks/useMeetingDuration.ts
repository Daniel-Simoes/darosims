import { useEffect, useState } from 'react';

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  if (hours > 0) {
    return `${hours}:${mm}:${ss}`;
  }
  return `${mm}:${ss}`;
}

export function useMeetingDuration(startedAtIso: string | undefined) {
  const [label, setLabel] = useState('00:00');

  useEffect(() => {
    if (!startedAtIso) {
      setLabel('00:00');
      return;
    }

    const started = new Date(startedAtIso).getTime();
    if (Number.isNaN(started)) {
      setLabel('00:00');
      return;
    }

    const tick = () => {
      const elapsed = Math.max(0, Math.floor((Date.now() - started) / 1000));
      setLabel(formatDuration(elapsed));
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [startedAtIso]);

  return label;
}