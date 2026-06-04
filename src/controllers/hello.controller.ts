import type { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import { getHello } from '../services/hello.service.js';
import { ok } from '../types/api.js';

export const hello = asyncHandler(async (_req: Request, res: Response) => {
  res.json(ok(getHello()));
});
