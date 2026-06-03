// .env is loaded via --end-file flag in package.json scripts

import http from 'http';
import app from './app'
import config from './config/env'
import initSockets from './sockets/index'

const SIGTERM = 'SIGTERM'
const SIGINT = 'SIGINT' +
    ''
// Create ra HTTP serve from express app.
// Socket.io needs this - it cannot attach to app.listen() directly
const server = http.createServer(app);

// Attach WebSocket layer to the same HTTP Server
const io = initSockets(server);
app.locals.io = io; // makes io accessible from any controller via req.app.locals.io

// - Start Listening
server.listen(config.port, () => {
    logger.info(`Server running on port ${config.port} [${config.nodeEnv}]`);
});

// Graceful shutdown
// When the hosting platform sends SIGTERM (deploy, scale-down),
// stop accepting new connections, finish in-flight requests, exit.
const shutdown = (signal) => {
    logger.info(`${signal} received - shutting down gracefully`);
    server.close(() => {
        logger.info("All connections closed. Bye.");
        process.exit(0)
    });
    // Force-kill if request do not finish in 10 seconds
    setTimeout(() => {
        logger.error('Forced shutdown - connections did not close in time');
        process.exit(1);
    }, 10000) // 10s
};
process.on(SIGTERM, () => shutdown(SIGTERM));
process.on(SIGINT, () => shutdown(SIGINT));

// Last resort error catchers
process.on('unhandledRejections', (reason) => {
    logger.error('UNHANDLED REJECTION:', err);
    process.exit(1); //process state is corrupted - MUST exit
});