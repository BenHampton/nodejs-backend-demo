import { z } from 'zod';

export const registerSchema = z
  .object({
    name: z.string().min(2).max(100).trim(),
    email: z.email().toLowerCase(),
    password: z.string().min(8).regex(/\d/, 'needs a number'),
  })
  .meta({ id: 'RegisterInput' });

export const loginSchema = z
  .object({
    email: z.email().toLowerCase(),
    password: z.string().min(1),
  })
  .meta({ id: 'LoginInput' });

// Types derived from the schemas - never drift from validation
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export interface SafeUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthResult {
  user: SafeUser;
  accessToken: string;
  refreshToken: string;
}
