import { getDatabaseProvider } from '@/database/provider';

const DEFAULT_JWT = 'daros-dev-jwt-secret-change-in-production';
const nodeEnv = process.env.NODE_ENV ?? 'development';

export function assertProductionSecrets() {
  if (nodeEnv !== 'production') return;
  const jwt = process.env.JWT_SECRET?.trim();
  if (!jwt || jwt === DEFAULT_JWT) {
    throw new Error('JWT_SECRET must be set to a strong random value in production');
  }
}

export const env = {
  jwtSecret: process.env.JWT_SECRET ?? DEFAULT_JWT,
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  nodeEnv,
  databaseProvider: getDatabaseProvider(),
  isProduction: nodeEnv === 'production',
} as const;