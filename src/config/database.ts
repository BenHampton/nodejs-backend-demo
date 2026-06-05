import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import config from './env.js';
import { onShutdown } from '../utils/lifecycle.js'
import { registerHealthCheck } from '../controllers/health.controller.js';

// Prisma 7: a driver adapter is mandatory; the client is generated into
// src/generated (not node_modules), so it's imported by relative path.
const adapter = new PrismaPg({ connectionString: config.databaseUrl! });
const prisma = new PrismaClient({ adapter });

// Because server.ts exposed onShutdown and the health controller exposed registerHealthCheck,
// the Prisma module wires its own cleanup and readiness probe on import.
// /health/ready now actually pings Postgres. No edits to server.ts or app.ts.

// Register cleanup + readiness check
onShutdown(() => prisma.$disconnect());

registerHealthCheck(async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      name: 'postgres',
      ok: true,
    };
  } catch {
    return {
      name: 'postgres',
      ok: false,
    };
  }
});

export default prisma;
