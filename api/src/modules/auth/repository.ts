import { Prisma, RoleName } from '@prisma/client';
import { prisma } from '../../db/prisma';

export const userWithRolesInclude = {
  roles: { include: { role: true } },
} satisfies Prisma.UserInclude;

export const authRepository = {
  findUserByEmail: async (email: string) => {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: userWithRolesInclude,
    });
  },

  findRefreshTokenByHash: async (tokenHash: string) => {
    return prisma.refreshToken.findUnique({
      where: { tokenHash },
    });
  },

  revokeRefreshToken: async (tokenId: string, replacedById?: string) => {
    return prisma.refreshToken.update({
      where: { id: tokenId },
      data: {
        revokedAt: new Date(),
        replacedById,
      },
    });
  },

  revokeAllUserRefreshTokens: async (userId: string) => {
    return prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  },

  createRefreshToken: async (userId: string, tokenHash: string, expiresAt: Date) => {
    return prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });
  },
};
