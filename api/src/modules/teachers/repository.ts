import { prisma } from '../../db/prisma';
import { Prisma } from '@prisma/client';

export const teacherWithUserInclude = {
  user: {
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      isActive: true,
      createdAt: true,
    },
  },
} satisfies Prisma.TeacherInclude;

export const teachersRepository = {
  findById: async (id: string) => {
    return prisma.teacher.findUnique({
      where: { id, deletedAt: null },
      include: teacherWithUserInclude,
    });
  },

  findByEmployeeNumber: async (employeeNumber: string) => {
    return prisma.teacher.findUnique({
      where: { employeeNumber, deletedAt: null },
      include: teacherWithUserInclude,
    });
  },

  list: async (params: {
    skip?: number;
    take?: number;
    where?: Prisma.TeacherWhereInput;
    orderBy?: Prisma.TeacherOrderByWithRelationInput;
  }) => {
    const { skip, take, where, orderBy } = params;
    
    const [items, totalCount] = await Promise.all([
      prisma.teacher.findMany({
        skip,
        take,
        where: { ...where, deletedAt: null },
        orderBy,
        include: teacherWithUserInclude,
      }),
      prisma.teacher.count({
        where: { ...where, deletedAt: null },
      }),
    ]);

    return { items, totalCount };
  },

  createWithUser: async (teacherData: Prisma.TeacherCreateWithoutUserInput, userData: Omit<Prisma.UserCreateInput, 'roles' | 'student' | 'teacher'>, roleId: string) => {
    return prisma.teacher.create({
      data: {
        ...teacherData,
        user: {
          create: {
            ...userData,
            roles: {
              create: {
                roleId,
              },
            },
          },
        },
      },
      include: teacherWithUserInclude,
    });
  },

  update: async (id: string, teacherData: Prisma.TeacherUpdateInput, userData: Prisma.UserUpdateInput) => {
    return prisma.teacher.update({
      where: { id },
      data: {
        ...teacherData,
        user: {
          update: userData,
        },
      },
      include: teacherWithUserInclude,
    });
  },

  softDelete: async (id: string, userId: string) => {
    const now = new Date();
    return prisma.$transaction([
      prisma.teacher.update({
        where: { id },
        data: { deletedAt: now },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { deletedAt: now, isActive: false },
      }),
    ]);
  },
};
