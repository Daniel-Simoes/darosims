import { useCallback, useEffect, useRef, useState } from 'react';
import { scrollToDashboardTop } from '../lib/ui/scrollToDashboardTop';

const SUCCESS_VISIBLE_MS = 5000;
const SUCCESS_FADE_MS = 450;

export function useFlashMessages() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [successFadingOut, setSuccessFadingOut] = useState(false);
  const timersRef = useRef<{
    fade?: ReturnType<typeof setTimeout>;
    clear?: ReturnType<typeof setTimeout>;
  }>({});

  useEffect(() => {
    const timers = timersRef.current;
    if (timers.fade) clearTimeout(timers.fade);
    if (timers.clear) clearTimeout(timers.clear);
    timers.fade = undefined;
    timers.clear = undefined;

    if (!success) {
      setSuccessFadingOut(false);
      return;
    }

    setSuccessFadingOut(false);
    timers.fade = setTimeout(() => setSuccessFadingOut(true), SUCCESS_VISIBLE_MS);
    timers.clear = setTimeout(() => {
      setSuccess('');
      setSuccessFadingOut(false);
    }, SUCCESS_VISIBLE_MS + SUCCESS_FADE_MS);

    return () => {
      if (timers.fade) clearTimeout(timers.fade);
      if (timers.clear) clearTimeout(timers.clear);
    };
  }, [success]);

  const showSuccess = useCallback((message: string) => {
    setError('');
    setSuccess(message);
    scrollToDashboardTop();
  }, []);

  const showError = useCallback((message: string) => {
    setSuccess('');
    setError(message);
    scrollToDashboardTop();
  }, []);

  return {
    error,
    success,
    successFadingOut,
    setError,
    setSuccess,
    showSuccess,
    showError,
  };
}