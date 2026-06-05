import { z } from 'zod';

export const notifySchema = z
  .object({
    targetUserId: z.uuid(),
    message: z.string().min(1).max(500),
  })
  .meta({ id: 'NotifyInput' });
