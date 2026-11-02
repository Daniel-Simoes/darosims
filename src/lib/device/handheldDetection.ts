export type HandheldStorePlatform = 'ios' | 'android' | 'other';

/** Phones and tablets — web dashboard/sign-in is desktop-only. */
export function isHandheldDevice(): boolean {
  if (typeof navigator === 'undefined') return false;

  const ua = navigator.userAgent;

  if (/iPhone|iPod|Android.*Mobile|webOS|BlackBerry|IEMobile|Opera Mini|Windows Phone/i.test(ua)) {
    return true;
  }

  if (/iPad/i.test(ua)) return true;
  if (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) return true;

  if (/Android/i.test(ua) && !/Mobile/i.test(ua)) return true;

  if (/Tablet|PlayBook|Silk|Kindle/i.test(ua)) return true;

  if (typeof window !== 'undefined') {
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const noHover = window.matchMedia('(hover: none)').matches;
    const touch = navigator.maxTouchPoints > 0;
    const narrow = window.innerWidth <= 1024;
    if (touch && coarse && noHover && narrow) return true;
  }

  return false;
}

export function getHandheldStorePlatform(): HandheldStorePlatform {
  const ua = navigator.userAgent;

  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
  if (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) return 'ios';

  if (/Android/i.test(ua)) return 'android';

  return 'other';
}

export function getAppStoreLabel(platform: HandheldStorePlatform): string {
  switch (platform) {
    case 'ios':
      return 'App Store';
    case 'android':
      return 'Google Play';
    default:
      return 'your device app store';
  }
}
