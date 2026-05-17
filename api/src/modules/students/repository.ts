import { prisma } from '../../db/prisma';
import { Prisma } from '@prisma/client';

export const studentWithUserInclude = {
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
} satisfies Prisma.StudentInclude;

export const studentsRepository = {
  findById: async (id: string) => {
    return prisma.student.findUnique({
      where: { id, deletedAt: null },
      include: studentWithUserInclude,
    });
  },

  findByStudentNumber: async (studentNumber: string) => {
    return prisma.student.findUnique({
      where: { studentNumber, deletedAt: null },
      include: studentWithUserInclude,
    });
  },

  list: async (params: {
    skip?: number;
    take?: number;
    where?: Prisma.StudentWhereInput;
    orderBy?: Prisma.StudentOrderByWithRelationInput;
  }) => {
    const { skip, take, where, orderBy } = params;
    
    const [items, totalCount] = await Promise.all([
      prisma.student.findMany({
        skip,
        take,
        where: { ...where, deletedAt: null },
        orderBy,
        include: studentWithUserInclude,
      }),
      prisma.student.count({
        where: { ...where, deletedAt: null },
      }),
    ]);

    return { items, totalCount };
  },

  createWithUser: async (studentData: Prisma.StudentCreateWithoutUserInput, userData: Omit<Prisma.UserCreateInput, 'roles' | 'student' | 'teacher'>, roleId: string) => {
    return prisma.student.create({
      data: {
        ...studentData,
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
      include: studentWithUserInclude,
    });
  },

  update: async (id: string, studentData: Prisma.StudentUpdateInput, userData: Prisma.UserUpdateInput) => {
    return prisma.student.update({
      where: { id },
      data: {
        ...studentData,
        user: {
          update: userData,
        },
      },
      include: studentWithUserInclude,
    });
  },

  softDelete: async (id: string, userId: string) => {
    const now = new Date();
    return prisma.$transaction([
      prisma.student.update({
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
