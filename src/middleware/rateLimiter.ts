import { rateLimit, ipKeyGenerator } from 'express-rate-limit';

// Strict limiter for auth touter - 10 attempts /15mins
// Keys by authenticated user id when present, else IP (NAT-safe).

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, //15 minutes
  limit: 10,
  standardHeaders: true, // sends RateLimit-* headers
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id ?? ipKeyGenerator(req.ip ?? 'unknown'),
});
