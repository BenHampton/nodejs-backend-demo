import config from '../config/env.js';
import prisma from '../config/database.js';
import { SignJWT, jwtVerify } from 'jose';
import {
  AuthResult,
  LoginInput,
  RegisterInput,
  SafeUser,
} from '../types/auth.dto.js';
import AppError from '../utils/AppError.js';
import argon2 from 'argon2';

interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
}

const users = new Map<string, StoredUser>();
const refreshStore = new Set<string>();

// jose uses Web Crypto - HMAC secrets must be Unit8Array, encoded once.
const ACCESS_SECRET = new TextEncoder().encode(config.jwt.accessSecret);
const REFRESH_SECRET = new TextEncoder().encode(config.jwt.refreshSecret);

const signAccess = (id: string) => {
  return new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(id)
    .setIssuedAt()
    .setExpirationTime(config.jwt.accessExpires)
    .sign(ACCESS_SECRET);
};

const signRefresh = (id: string) => {
  return new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(id)
    .setIssuedAt()
    .setExpirationTime(config.jwt.refreshExpires)
    .sign(REFRESH_SECRET);
};

const safe = (u: StoredUser): SafeUser => {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
  };
};

export const registerUsingInMemory = async ({
  name,
  email,
  password,
}: RegisterInput): Promise<AuthResult> => {
  if ([...users.values()].some((user) => user.email === email)) {
    throw new AppError('Email already in use', 409);
  }

  const user: StoredUser = {
    id: crypto.randomUUID(),
    name,
    email,
    passwordHash: await argon2.hash(password),
  };

  users.set(user.id, user);

  const refreshToken = await signRefresh(user.id);
  refreshStore.add(refreshToken);

  return {
    user: safe(user),
    accessToken: await signAccess(user.id),
    refreshToken,
  };
};

// using postgres
export const register = async ({
  name,
  email,
  password,
}: RegisterInput): Promise<AuthResult> => {
  const passwordHash = await argon2.hash(password);

  // Atomic: user + refresh token created together, or neither
  const { user, refreshToken } = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { name, email, passwordHash },
      select: { id: true, name: true, email: true },
    });

    const refreshToken = await signRefresh(user.id);

    await tx.refreshToken.create({
      data: { userId: user.id, token: refreshToken },
    });

    return { user, refreshToken };
  });

  return {
    user,
    accessToken: await signAccess(user.id),
    refreshToken,
  };
};

export const login = async ({
  email,
  password,
}: LoginInput): Promise<AuthResult> => {
  const user = [...users.values()].find((user) => user.email === email);

  if (!user || !(await argon2.verify(user.passwordHash, password))) {
    throw new AppError('Invalid email or password', 401);
  }

  const refreshToken = await signRefresh(user.id);
  refreshStore.add(refreshToken);

  return {
    user: safe(user),
    accessToken: await signAccess(user.id),
    refreshToken,
  };
};

export const refresh = async (
  token: string,
): Promise<{ accessToken: string }> => {
  if (!refreshStore.has(token)) {
    throw new AppError('Token revoked', 401);
  }

  try {
    const { payload } = await jwtVerify(token, REFRESH_SECRET);
    return {
      accessToken: await signAccess(payload.sub!),
    };
  } catch {
    throw new AppError('Invalid refresh token', 401);
  }
};

export const logout = (token: string): void => {
  refreshStore.delete(token);
};
