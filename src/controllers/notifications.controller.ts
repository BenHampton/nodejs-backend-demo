import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import { ok } from '../types/api.js';

export const notify = asyncHandler(async (req: Request, res: Response) => {
  const { targetUserId, message } = req.body;
  req.app.locals.io
    .to(`user: ${targetUserId}`)
    .emit('notification', { message, from: req.user!.id });
  res.json(ok({ sent: true }));
});
