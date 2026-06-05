import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import { ok } from '../types/api.js';
import { getCachedUser } from '../services/cache-demo.service.js';

export const cacheDemo = asyncHandler(async (req: Request, res: Response) => {
  res.json(ok(await getCachedUser(req.params.id as string)));
});
