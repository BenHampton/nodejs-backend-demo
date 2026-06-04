import type { ErrorRequestHandler } from 'express';
import logger from '../utils/logger.js';
import type { ApiError } from '../types/api.js';

interface Err extends Error {
  statusCode?: number;
  code?: string;
  isOperational?: boolean;
}

const errorHandler: ErrorRequestHandler = (err: Err, req, res, _next) => {
  // Normalise known library errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    err.statusCode = 401;
    err.isOperational = true;
  }

  if (err.code === 'P2002') {
    err.statusCode = 409;
    err.isOperational = true;
  }

  if (err.code === 'P2025') {
    err.statusCode = 404;
    err.isOperational = true;
  }

  const status = err.statusCode ?? 500;
  if (status >= 500) {
    req.log.error({ err }, 'Unhandled error');
  }

  const body: ApiError = {
    error: {
      message: err.isOperational ? err.message : 'Internal Server Error',
      ...(err.code && { code: err.code }),
    },
  };

  res.status(status).json(body);
};

export default errorHandler;
