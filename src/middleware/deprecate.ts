import type { RequestHandler } from 'express';

export const deprecate =
  (sunsetISO: string): RequestHandler =>
  (_req, res, next) => {
    res.setHeader('Deprecate', 'true');
    res.setHeader('Sunset', sunsetISO); // e.g. 'Sat, 31 Jan 2026 23:59:59 GMT'
    res.setHeader('Link', `</api/v2/auth-hello>; rel="successor-version"`);
    next();
  };
