import http from 'http';
import app from './app.js';
import config from './config/env.js';
import logger from './utils/logger.js';
// import initSockets from "./sockets/index";

const SIGTERM = 'SIGTERM';
const SIGINT = 'SIGINT' + '';

// Create ra HTTP serve from express app.
// Socket.io needs this - it cannot attach to app.listen() directly
const server = http.createServer(app);

// Attach WebSocket layer to the same HTTP Server
// const io = initSockets(server);
// app.locals.io = io; // makes io accessible from any controller via req.app.locals.io

// Start Listening
server.listen(config.port, () => {
  logger.info(
    `Server running on port ${config.port} [${config.nodeEnv}] - docs at /docs`,
  );
});

// Graceful shutdown. Each integration registers its own cleanup here
const cleanups: Array<() => Promise<unknown>> = [];
export const onShutdown = (fn: () => Promise<unknown>) => cleanups.push(fn);

// When the hosting platform sends SIGTERM (deploy, scale-down),
// stop accepting new connections, finish in-flight requests, exit.
const shutdown = async (sig: string) => {
  logger.info(`${sig} - draining`);
  server.close(async () => {
    await Promise.allSettled(cleanups.map((c) => c()));
    process.exit(0);
  });

  // Force-kill if request do not finish in 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown - connections did not close in time');
    process.exit(1);
  }, 10000).unref();
};
process.on(SIGTERM, () => shutdown(SIGTERM));
process.on(SIGINT, () => shutdown(SIGINT));
// Last resort error catchers
process.on('unhandledRejections', (reason) => {
  logger.error(reason, 'unhandledRejection');
  shutdown('unhandledRejection');
  process.exit(1); //process state is corrupted - MUST exit
});

process.on('uncaughtException', (e) => {
  logger.error(e, 'uncaughtException');
  process.exit(1);
});
