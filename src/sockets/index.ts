import { Server } from 'socket.io';
import type { Server as HttpServer } from 'node:http';
import config from '../config/env.js';
import logger from '../utils/logger.js';
import { jwtVerify } from 'jose';

const ACCESS_SECRET = new TextEncoder().encode(config.jwt.accessSecret);

// Wrap async socket handlers - an unhandled throw here would otherwise
// vanish silently (Express error middleware does NOT catch socket errors).
const safe = (fn: (...a: any[]) => Promise<void>) => {
  return (...a: any[]) =>
    fn(...a).catch((e) => logger.error({ err: e }, 'scoket handler failed'));
};

export const initSockets = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: { origin: config.corsOrigins, credentials: true },
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;

    if (!token) {
      return next(new Error('Auth required'));
    }

    try {
      const { payload } = await jwtVerify(token, ACCESS_SECRET);
      socket.data.userId = payload.sub;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userID as string;
    socket.join(`user:${userId}`);
    socket.on(
      'send_message',
      safe(async ({ room, content }) => {
        socket.to(room).emit('new_message', {
          userId,
          content,
          ts: new Date().toISOString(),
        });
      }),
    );
  });

  return io;
};
