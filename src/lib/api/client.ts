const TOKEN_KEY = 'daros_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(path, { ...options, headers });
  let data: Record<string, unknown> = {};

  try {
    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else if (!response.ok) {
      const text = await response.text();
      if (text.includes('<!doctype html') || text.includes('<html')) {
        throw new Error(
          'API request failed. Make sure the backend is running on port 3000 and restart the frontend dev server.',
        );
      }
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('API request failed')) {
      throw error;
    }
    data = {};
  }

  if (!response.ok) {
    throw new Error(
      typeof data.error === 'string' ? data.error : `Request failed (${response.status})`,
    );
  }

  return data as T;
}
