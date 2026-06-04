import type { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import { ok } from '../types/api.js';

// v1 payload - superseded by v2 in a future section
export const authHelloV1 = asyncHandler(async (req: Request, res: Response) => {
  res.json(ok({ message: 'hello-world-authenticated', userId: req.user!.id }));
});
