import { Request, Response, CookieOptions } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import * as svc from '../services/auth.service.js';
import { ok } from '../types/api.js';

const COOKIE: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: 'api/v1/auth',
  maxAge: 7 * 864e5,
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { user, accessToken, refreshToken } = await svc.register(req.body);
  res.cookie('refreshToken', refreshToken, COOKIE);
  res.status(201).json(ok({ user, accessToken }));
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { user, accessToken, refreshToken } = await svc.login(req.body);
  res.cookie('refreshToken', refreshToken, COOKIE);
  res.json(ok({ user, accessToken }));
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    res.status(401).json({ error: { message: 'No refresh token' } });
    return;
  }
  res.json(ok(await svc.refresh(token)));
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  if (req.cookies?.refreshToken) {
    svc.logout(req.cookies.refreshToken);
  }
  res.clearCookie('refreshToken', COOKIE).json(ok({ loggedOut: true }));
});
