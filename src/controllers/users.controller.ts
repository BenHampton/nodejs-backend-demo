import asyncHandler from '../utils/asyncHandler.js';
import { Request, Response } from 'express';
import { ok } from '../types/api.js';
import * as svc from '../services/users.service.js';
import {listQuery} from "../types/users.dto.js";

export const list = asyncHandler(async (req: Request, res: Response) => {
    // hand rolled limit/cursor
  // const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  // res.json(ok(await svc.list(limit, req.query.cursor as string)));

    // in Express 5, req.query is read-only
    const { limit, cursor } = listQuery.parse(req.query)
    res.json(ok(await svc.list(limit, cursor)));
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  res.json(ok(await svc.getWithPosts(req.params.id as string)));
});
