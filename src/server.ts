import http from 'http';
import app from './app.js';
import config from './config/env.js';
import logger from './utils/logger.js';
import { bootstrap } from './bootstrap.js';
// import initSockets from "./sockets/index";

const { server, shutdown } = await bootstrap();

const SIGTERM = 'SIGTERM';
const SIGINT = 'SIGINT' + '';

// Attach WebSocket layer to the same HTTP Server
// const io = initSockets(server);
// app.locals.io = io; // makes io accessible from any controller via req.app.locals.io

// Start Listening
server.listen(config.port, () => {
  logger.info(
    `Server running on port ${config.port} [${config.nodeEnv}] - docs at /docs`,
  );
});

// Graceful shutdown — integrations register cleanup via onShutdown (lifecycle.ts).
// When the hosting platform sends SIGTERM (deploy, scale-down),
// stop accepting new connections, finish in-flight requests, exit.

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
