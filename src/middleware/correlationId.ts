import crypto from 'node:crypto';
import type { RequestHandler } from 'express';

const correlationId: RequestHandler = (req, res, next) => {
  const id = (req.headers['x-request-id'] as string) ?? crypto.randomUUID();
  req.id = id;
  res.setHeader('X-Request-ID', id);
  res.log = res.log.child({ requestId: id });
  next();
};

export default correlationId;
