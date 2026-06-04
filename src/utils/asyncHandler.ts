import type { Request, Response, NextFunction, RequestHandler } from 'express';
type AsyncFn = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void>;

/**
 * Wraps an async route handler so thrown errors are
 * automatically passed to Express's error handler.
 *
 * Usage:
 *   router.get('/', asyncHandler(async (req, res) => {
 *     const data = await someService.doStuff(); // if this throws...
 *     res.json({ data }); // ...it's caught!
 *   }));
 */

const asyncHandler =
  (fn: AsyncFn): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

export default asyncHandler;
