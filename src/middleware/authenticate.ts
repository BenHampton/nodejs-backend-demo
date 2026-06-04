import { RequestHandler } from 'express';
import AppError from '../utils/AppError.js';
import config from '../config/env.js';
import { jwtVerify } from 'jose';

const ACCESS_SECRET = new TextEncoder().encode(config.jwt.accessSecret);

// req.user is declared int src/types/express.d.ts
const authenticate: RequestHandler = async (req, _res, next) => {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    const appError = new AppError('Authentication required', 401);
    return next(appError);
  }

  try {
    const { payload } = await jwtVerify(header?.slice(7), ACCESS_SECRET);
    req.user = { id: payload.sub! };
    next();
  } catch {
    const appError = new AppError('Invalid or expired token', 401);

    next(appError);
  }
};

export default authenticate;
