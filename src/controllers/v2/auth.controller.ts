import { Request, Response } from 'express';
import asyncHandler from '../../utils/asyncHandler.js';
import { ok } from '../../types/api.js';

// V2: nested user object + apiVersion + issuedAt (breaking shape change)
export const authHelloV2 = asyncHandler(async (req: Request, res: Response) => {
  res.json(
      ok({
        message: 'hello-world-authenticated',
        user: { id: req.user!.id },
        apiVersion: '2',
        issuedAt: new Date().toDateString(),
      }),
  );
});