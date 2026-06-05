import type { Request, Response } from 'express';

export type Check = () => Promise<{
  name: string;
  ok: boolean;
}>;

let checks: Check[] = [];

export const setHealthChecks = (c: Check[]) => {
  checks = c;
};

//Liveness: is the process up? (cheap - for restart decisions)
export const live = (_req: Request, res: Response) => {
  res.json({ data: { status: 'ok', uptime: process.uptime() } });
};

// Readiness: can it serve traffic? (checks deps - for LB routing)
export const ready = async (_req: Request, res: Response) => {
  const results = await Promise.all(checks.map((check) => check()));
  const healthy = results.every((result) => result.ok);

  res.status(healthy ? 200 : 503).json({
    data: { status: healthy ? 'ready' : 'degraded', checks: results },
  });
};
