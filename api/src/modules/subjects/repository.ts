import { prisma } from '../../db/prisma';
import { Prisma } from '@prisma/client';

export const subjectWithTeacherInclude = {
  teacher: {
    select: {
      id: true,
      employeeNumber: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  },
} satisfies Prisma.SubjectInclude;

export const subjectsRepository = {
  findById: async (id: string) => {
    return prisma.subject.findUnique({
      where: { id, deletedAt: null },
      include: subjectWithTeacherInclude,
    });
  },

  findByCode: async (code: string) => {
    return prisma.subject.findUnique({
      where: { code, deletedAt: null },
    });
  },

  list: async (params: {
    skip?: number;
    take?: number;
    where?: Prisma.SubjectWhereInput;
    orderBy?: Prisma.SubjectOrderByWithRelationInput;
  }) => {
    const { skip, take, where, orderBy } = params;
    
    const [items, totalCount] = await Promise.all([
      prisma.subject.findMany({
        skip,
        take,
        where: { ...where, deletedAt: null },
        orderBy,
        include: subjectWithTeacherInclude,
      }),
      prisma.subject.count({
        where: { ...where, deletedAt: null },
      }),
    ]);

    return { items, totalCount };
  },

  create: async (data: Prisma.SubjectCreateInput) => {
    return prisma.subject.create({
      data,
      include: subjectWithTeacherInclude,
    });
  },

  update: async (id: string, data: Prisma.SubjectUpdateInput) => {
    return prisma.subject.update({
      where: { id },
      data,
      include: subjectWithTeacherInclude,
    });
  },

  softDelete: async (id: string) => {
    return prisma.subject.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },
};
