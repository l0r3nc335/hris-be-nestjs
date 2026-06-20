export default () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),
  corsOrigins: (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean),
  databaseUrl: process.env.DATABASE_URL,
  redis: {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  },
  jwt: {
    accessSecret:
      process.env.JWT_ACCESS_SECRET ?? 'dev-access-secret-change-in-production',
    refreshSecret:
      process.env.JWT_REFRESH_SECRET ??
      'dev-refresh-secret-change-in-production',
    accessExpires: process.env.JWT_ACCESS_EXPIRES ?? '15m',
    refreshExpires: process.env.JWT_REFRESH_EXPIRES ?? '7d',
  },
  cookies: {
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: (process.env.COOKIE_SAME_SITE ?? 'lax') as
      | 'lax'
      | 'strict'
      | 'none',
  },
  uploadDir: process.env.UPLOAD_DIR ?? './uploads',
  apiVersion: process.env.API_VERSION ?? '1.0.0',
});
