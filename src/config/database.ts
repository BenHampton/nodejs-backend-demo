import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import config from './env.js';
import { Check } from '../controllers/health.controller.js';

// Prisma 7: a driver adapter is mandatory; the client is generated into
// src/generated (not node_modules), so it's imported by relative path.
const adapter = new PrismaPg({ connectionString: config.databaseUrl! });
const prisma = new PrismaClient({ adapter });

// Readiness check — the composition root wires this in (no self-registration).
export const dbHealth: Check = async () => {
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
};

export default prisma;
