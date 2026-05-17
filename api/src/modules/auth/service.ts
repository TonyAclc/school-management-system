import bcrypt from 'bcrypt';
import { RoleName } from '@prisma/client';
import { env } from '../../config/env';
import { prisma } from '../../db/prisma';
import { UnauthorizedError, ConflictError } from '../../shared/errors/app-error';
import { logger } from '../../shared/utils/logger';
import { hashPassword, verifyPassword } from '../../shared/utils/password';
import { generateRefreshToken, hashToken } from '../../shared/utils/token';
import { signAccessToken } from '../../shared/utils/jwt';
import { parseDuration } from '../../shared/utils/duration';
import { authRepository } from './repository';
import { RegisterBody, LoginBody, RefreshBody, LogoutBody } from './dtos';
import { TokenPair, PublicUser } from './types';

// Pre-computed once at module load
const TIMING_DUMMY_HASH = bcrypt.hashSync('timing_equalization_only', env.BCRYPT_ROUNDS);

const toPublicUser = (user: any): PublicUser => ({
  id: user.id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  phone: user.phone,
  isActive: user.isActive,
  roles: user.roles.map((r: any) => r.role.name),
});

const issueTokens = async (user: any): Promise<TokenPair> => {
  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    roles: user.roles.map((r: any) => r.role.name),
  });

  const rawRefreshToken = generateRefreshToken();
  const tokenHash = hashToken(rawRefreshToken);
  const expiresInMs = parseDuration(env.JWT_REFRESH_TTL);
  const expiresAt = new Date(Date.now() + expiresInMs);

  const storedToken = await authRepository.createRefreshToken(user.id, tokenHash, expiresAt);

  return {
    accessToken,
    refreshToken: rawRefreshToken,
    refreshTokenId: storedToken.id,
    tokenType: 'Bearer',
    expiresIn: parseDuration(env.JWT_ACCESS_TTL) / 1000,
    user: toPublicUser(user),
  };
};

export const authService = {
  register: async (input: RegisterBody): Promise<TokenPair> => {
    const existing = await authRepository.findUserByEmail(input.email);
    if (existing) throw new ConflictError('Email already registered');

    const passwordHash = await hashPassword(input.password);
    const lowerEmail = input.email.toLowerCase();

    return prisma.$transaction(async (tx) => {
      // Find STUDENT role
      const studentRole = await tx.role.findUniqueOrThrow({ where: { name: RoleName.STUDENT } });

      const newUser = await tx.user.create({
        data: {
          email: lowerEmail,
          passwordHash,
          firstName: input.firstName,
          lastName: input.lastName,
          phone: input.phone,
        },
      });

      await tx.userRole.create({
        data: { userId: newUser.id, roleId: studentRole.id },
      });

      // Refetch to get user with roles for token generation
      const userWithRoles = await tx.user.findUniqueOrThrow({
        where: { id: newUser.id },
        include: { roles: { include: { role: true } } },
      });

      return issueTokens(userWithRoles);
    });
  },

  login: async (input: LoginBody): Promise<TokenPair> => {
    const user = await authRepository.findUserByEmail(input.email);

    if (user === null || user.deletedAt !== null || !user.isActive) {
      if (user === null) await verifyPassword(input.password, TIMING_DUMMY_HASH); // burn cycles
      throw new UnauthorizedError('Invalid credentials');
    }

    const valid = await verifyPassword(input.password, user.passwordHash);
    if (!valid) throw new UnauthorizedError('Invalid credentials');

    return issueTokens(user);
  },

  refresh: async (input: RefreshBody): Promise<TokenPair> => {
    const stored = await authRepository.findRefreshTokenByHash(hashToken(input.refreshToken));

    if (!stored) throw new UnauthorizedError('Invalid refresh token');
    if (stored.expiresAt < new Date()) throw new UnauthorizedError('Refresh token expired');

    if (stored.revokedAt !== null) {
      // Reuse detected - revoke all
      await authRepository.revokeAllUserRefreshTokens(stored.userId);
      logger.warn({ userId: stored.userId }, 'refresh-token reuse — all sessions revoked');
      throw new UnauthorizedError('Refresh token reused — session revoked');
    }

    const user = await prisma.user.findUnique({
      where: { id: stored.userId },
      include: { roles: { include: { role: true } } },
    });

    if (!user || user.deletedAt !== null || !user.isActive) {
      throw new UnauthorizedError('User inactive or deleted');
    }

    const pair = await issueTokens(user);
    await authRepository.revokeRefreshToken(stored.id, pair.refreshTokenId);
    return pair;
  },

  logout: async (input: LogoutBody): Promise<void> => {
    const stored = await authRepository.findRefreshTokenByHash(hashToken(input.refreshToken));
    if (stored && stored.revokedAt === null) {
      await authRepository.revokeRefreshToken(stored.id);
    }
  },

  me: async (userId: string): Promise<PublicUser> => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { roles: { include: { role: true } } },
    });

    if (!user || user.deletedAt !== null || !user.isActive) {
      throw new UnauthorizedError('User inactive or deleted');
    }

    return toPublicUser(user);
  },
};
