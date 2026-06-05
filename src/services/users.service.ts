import prisma from '../config/database.js';
import AppError from '../utils/AppError.js';

const SAFE = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
} as const;

// Cursor Pagination - 0(1) regardless of offset depth.
export const list = async (limit = 20, cursor?: string) => {
  const rows = await prisma.user.findMany({
    select: SAFE,
    take: limit + 1, // fetch one extra to detect more
    ...(cursor && { skip: 1, cursor: { id: cursor } }),
    orderBy: { id: 'asc' },
  });

  const hasMore = rows.length > limit;
  const users = hasMore ? rows.slice(0, -1) : rows;

  return {
    users,
    pageInfo: {
      hasMore,
      nextCursor: hasMore ? users.at(-1)!.id : null,
    },
  };
};

// Explicit relation load - no lazy proxies, no N+1 surprises.
export const getWithPosts = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      ...SAFE,
      posts: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
};
