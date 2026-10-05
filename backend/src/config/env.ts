export const env = {
  jwtSecret: process.env.JWT_SECRET ?? 'daros-dev-jwt-secret-change-in-production',
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  nodeEnv: process.env.NODE_ENV ?? 'development',
} as const;
