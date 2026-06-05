import redis from '../config/redis.js';
import prisma from '../config/database.js';
import AppError from '../utils/AppError.js';

const TTL = 300;

export const getCachedUser = async (id: string) => {
  const key = `user:${id}`;
  const hit = await redis.get(key);

  if (hit) {
    return {
      source: 'cache',
      user: JSON.parse(hit),
    };
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true },
  });

  if (!user) {
    throw new AppError('User not found', 404); // note: never cached
  }

  await redis.setEx(key, TTL, JSON.stringify(user));

  return {
    source: 'db',
    user,
  };
};

export const invalidateUser = (id: string) => {
  return redis.del(`user:${id}`);
};
