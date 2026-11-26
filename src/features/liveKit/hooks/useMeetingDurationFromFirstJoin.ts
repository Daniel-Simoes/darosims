import { useParticipants } from '@livekit/components-react';
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

/** Starts when the first participant joins the LiveKit room. */
export function useMeetingDurationFromFirstJoin() {
  const participants = useParticipants();
  const [anchorMs, setAnchorMs] = useState<number | null>(null);
  const [label, setLabel] = useState('00:00');

  useEffect(() => {
    if (participants.length === 0) return;

    let earliest: number | null = null;
    for (const participant of participants) {
      const joined = participant.joinedAt?.getTime();
      if (joined && !Number.isNaN(joined)) {
        earliest = earliest === null ? joined : Math.min(earliest, joined);
      }
    }

    if (earliest === null) {
      earliest = Date.now();
    }

    setAnchorMs((prev) => (prev === null ? earliest : Math.min(prev, earliest)));
  }, [participants]);

  useEffect(() => {
    if (anchorMs === null) {
      setLabel('00:00');
      return;
    }

    const tick = () => {
      const elapsed = Math.max(0, Math.floor((Date.now() - anchorMs) / 1000));
      setLabel(formatDuration(elapsed));
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [anchorMs]);

  return label;
}