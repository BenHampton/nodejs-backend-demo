import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';

const validate =
  (schema: ZodType, source: 'body' | 'params' = 'body'): RequestHandler =>
  (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      res.status(400).json({
        error: {
          message: 'Validation failed',
          details: result.error.issues.map((i) => ({
            field: i.path.join('.'),
            message: i.message,
          })),
        },
      });
      return;
    }

    req[source] = result.data;
    next();
  };

export default validate;
