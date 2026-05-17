import { Prisma } from '@prisma/client';
import { prisma } from '../../db/prisma';
import { userWithRolesInclude } from '../auth/repository';
import { ListUsersQuery } from './dtos';
import { paginationToSkipTake } from '../../shared/utils/pagination';

export const usersRepository = {
  findById: async (id: string) => {
    return prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: userWithRolesInclude,
    });
  },

  findByEmail: async (email: string) => {
    return prisma.user.findFirst({
      where: { email: email.toLowerCase(), deletedAt: null },
    });
  },

  findRoleByName: async (name: string) => {
    return prisma.role.findUnique({
      where: { name: name as any },
    });
  },

  list: async (query: ListUsersQuery) => {
    const where: Prisma.UserWhereInput = { deletedAt: null };

    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.role) {
      where.roles = { some: { role: { name: query.role } } };
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    const { skip, take } = paginationToSkipTake(query);
    
    // Sort logic mapping
    let orderBy: Prisma.UserOrderByWithRelationInput = {};
    if (query.sortBy === 'lastLoginAt') {
      // If lastLoginAt is needed, it would typically be a relation or a specific column
      orderBy = { createdAt: query.sortOrder }; // Fallback for now
    } else {
      orderBy = { [query.sortBy]: query.sortOrder };
    }

    const [items, totalCount] = await prisma.$transaction([
      prisma.user.findMany({ where, include: userWithRolesInclude, orderBy, skip, take }),
      prisma.user.count({ where }),
    ]);

    return { items, totalCount };
  },

  create: async (data: Prisma.UserCreateInput, roleNames: string[]) => {
    return prisma.$transaction(async (tx) => {
      const roles = await tx.role.findMany({
        where: { name: { in: roleNames as any } },
      });

      const user = await tx.user.create({
        data: {
          ...data,
          roles: {
            create: roles.map(r => ({ roleId: r.id })),
          },
        },
        include: userWithRolesInclude,
      });

      return user;
    });
  },

  update: async (id: string, data: Prisma.UserUpdateInput, roleNames?: string[]) => {
    return prisma.$transaction(async (tx) => {
      if (roleNames) {
        await tx.userRole.deleteMany({ where: { userId: id } });
        const roles = await tx.role.findMany({
          where: { name: { in: roleNames as any } },
        });
        data.roles = {
          create: roles.map(r => ({ roleId: r.id })),
        };
      }

      return tx.user.update({
        where: { id },
        data,
        include: userWithRolesInclude,
      });
    });
  },

  softDelete: async (id: string) => {
    return prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  },
};
