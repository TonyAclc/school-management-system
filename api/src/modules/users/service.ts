import { RoleName } from '@prisma/client';
import { usersRepository } from './repository';
import { authRepository } from '../auth/repository';
import { ForbiddenError, NotFoundError, ConflictError } from '../../shared/errors/app-error';
import { RequesterContext, PublicUser } from '../auth/types';
import { CreateUserBody, UpdateUserBody, ListUsersQuery } from './dtos';
import { buildPaginatedResult, PaginatedResult } from '../../shared/utils/pagination';
import { hashPassword } from '../../shared/utils/password';

const isAdmin = (r: RequesterContext) => r.roles.includes(RoleName.ADMIN);

const toPublicUser = (user: any): PublicUser => ({
  id: user.id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  phone: user.phone,
  isActive: user.isActive,
  roles: user.roles.map((r: any) => r.role.name),
});

export const usersService = {
  list: async (query: ListUsersQuery, requester: RequesterContext): Promise<PaginatedResult<PublicUser>> => {
    if (!isAdmin(requester)) throw new ForbiddenError();
    const { items, totalCount } = await usersRepository.list(query);
    return buildPaginatedResult(items.map(toPublicUser), totalCount, query);
  },

  get: async (id: string, requester: RequesterContext): Promise<PublicUser> => {
    if (!isAdmin(requester) && requester.id !== id) throw new ForbiddenError();
    
    const user = await usersRepository.findById(id);
    if (!user) throw new NotFoundError('User');
    
    return toPublicUser(user);
  },

  create: async (input: CreateUserBody, requester: RequesterContext): Promise<PublicUser> => {
    if (!isAdmin(requester)) throw new ForbiddenError();

    const existing = await usersRepository.findByEmail(input.email);
    if (existing) throw new ConflictError('Email already in use');

    const passwordHash = await hashPassword(input.password);
    const user = await usersRepository.create({
      email: input.email.toLowerCase(),
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      isActive: input.isActive,
    }, input.roles);

    return toPublicUser(user);
  },

  update: async (id: string, input: UpdateUserBody, requester: RequesterContext): Promise<PublicUser> => {
    const admin = isAdmin(requester);
    const isSelf = requester.id === id;
    
    if (!admin && !isSelf) throw new ForbiddenError();

    if (!admin && (input.email || input.isActive !== undefined || input.roles !== undefined)) {
      throw new ForbiddenError('Only admins can change email, roles, or active status');
    }

    const user = await usersRepository.findById(id);
    if (!user) throw new NotFoundError('User');

    if (input.email && input.email.toLowerCase() !== user.email) {
      const existing = await usersRepository.findByEmail(input.email);
      if (existing) throw new ConflictError('Email already in use');
    }

    const updatedUser = await usersRepository.update(id, {
      ...(input.email && { email: input.email.toLowerCase() }),
      ...(input.firstName && { firstName: input.firstName }),
      ...(input.lastName && { lastName: input.lastName }),
      ...(input.phone !== undefined && { phone: input.phone }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
    }, input.roles);

    return toPublicUser(updatedUser);
  },

  remove: async (id: string, requester: RequesterContext): Promise<void> => {
    if (!isAdmin(requester)) throw new ForbiddenError();
    if (id === requester.id) throw new ConflictError('Admin cannot delete themselves');

    const user = await usersRepository.findById(id);
    if (!user) throw new NotFoundError('User');

    await usersRepository.softDelete(id);
    await authRepository.revokeAllUserRefreshTokens(id);
  },
};
