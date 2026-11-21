import { env } from '@/config/env';

export function safeApiError(publicMessage: string, err?: unknown, logLabel?: string): string {
  if (logLabel) {
    console.error(logLabel, err);
  } else if (err) {
    console.error(err);
  }
  if (env.nodeEnv === 'production') {
    return publicMessage;
  }
  if (err instanceof Error) {
    return `${publicMessage}: ${err.message}`;
  }
  return publicMessage;
}