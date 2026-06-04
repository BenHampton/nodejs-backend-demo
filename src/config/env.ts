import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().default(3000),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES: z.string().default('15m'),
  JWT_REFRESH_EXPIRES: z.string().default('7d'),
  DATABASE_URL: z.url().optional(),
  REDIS_URL: z.url().default('redis://localhost:6379'),
  ALLOWED_ORIGINS: z.string().transform((s) => s.split(',')),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid environment', z.treeifyError(parsed.error));
  process.exit(1);
}

const env = parsed.data;

export const config = Object.freeze({
  port: env.PORT,
  nodeEnv: env.NODE_ENV,
  jwt: {
    accessSecret: env.JWT_ACCESS_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
    accessExpires: env.JWT_ACCESS_EXPIRES,
    refreshExpires: env.JWT_REFRESH_EXPIRES,
  },
  redisUrl: env.REDIS_URL,
  corsOrigins: env.ALLOWED_ORIGINS,
});

export type Config = typeof config;
export default config;
