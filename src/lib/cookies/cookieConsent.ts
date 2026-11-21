const STORAGE_KEY = 'daros_cookie_consent';

export type CookieConsentChoice = 'essential' | 'pending';

export function getCookieConsent(): CookieConsentChoice | null {
  if (typeof localStorage === 'undefined') return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === 'essential') return 'essential';
  return null;
}

export function setCookieConsentEssential(): void {
  localStorage.setItem(STORAGE_KEY, 'essential');
}

export function hasCookieConsentAnswer(): boolean {
  return getCookieConsent() === 'essential';
}