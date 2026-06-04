import type { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import { getHello } from '../services/hello.service';
import { ok } from '../types/api';

export const hello = asyncHandler(async (_req: Request, res: Response) => {
  res.json(ok(getHello()));
});
