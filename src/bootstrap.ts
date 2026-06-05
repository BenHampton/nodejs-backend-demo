import http from 'http';
import app from './app.js';
import logger from './utils/logger.js';
import { setHealthChecks } from './controllers/health.controller.js';
import prisma, { dbHealth } from './config/database.js';
import { initSockets } from './sockets/index.js';
import redis, { connectRedis, redisHealth } from './config/redis.js';

type Cleanup = () => Promise<unknown>;

// The composition root. Constructs integrations in order, wires their tear down,
// and returns the server + an ordered shutdown. Nothing self-registers.
export async function bootstrap() {
  // Create ra HTTP serve from express app.
  // Socket.io needs this - it cannot attach to app.listen() directly
  const server = http.createServer(app);

  const cleanups: Cleanup[] = [];

  // integrations wire up

  // Postgres
  cleanups.push(() => prisma.$disconnect()); // drained on shutdown

  // Sockets
  const io = initSockets(server);
  app.locals.io = io;
  cleanups.push(() => io.close());

  // Redis
  await connectRedis(); // explicit, ordered connect
  cleanups.push(() => redis.quit()); // drained on shutdown

  // Health Checks
  setHealthChecks([dbHealth, redisHealth]); // readiness checks

  const shutdown = async (sig: string) => {
    logger.info(`${sig} - draining`);

    // Force-kill if request do not finish in 10 seconds
    setTimeout(() => {
      logger.error('Forced shutdown - connections did not close in time');
      process.exit(1);
    }, 10000).unref();

    server.close(async () => {
      await Promise.allSettled(cleanups.map((c) => c()));
      process.exit(0);
    });
  };

  return { server, shutdown };
}
