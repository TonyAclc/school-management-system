import { prisma } from '../../db/prisma';
import { Prisma } from '@prisma/client';

export const classWithTeacherInclude = {
  homeroomTeacher: {
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
} satisfies Prisma.ClassInclude;

export const classesRepository = {
  findById: async (id: string) => {
    return prisma.class.findUnique({
      where: { id, deletedAt: null },
      include: classWithTeacherInclude,
    });
  },

  list: async (params: {
    skip?: number;
    take?: number;
    where?: Prisma.ClassWhereInput;
    orderBy?: Prisma.ClassOrderByWithRelationInput;
  }) => {
    const { skip, take, where, orderBy } = params;
    
    const [items, totalCount] = await Promise.all([
      prisma.class.findMany({
        skip,
        take,
        where: { ...where, deletedAt: null },
        orderBy,
        include: {
          ...classWithTeacherInclude,
          _count: {
            select: { enrollments: { where: { deletedAt: null } } }
          }
        },
      }),
      prisma.class.count({
        where: { ...where, deletedAt: null },
      }),
    ]);

    return { items, totalCount };
  },

  create: async (data: Prisma.ClassCreateInput) => {
    return prisma.class.create({
      data,
      include: classWithTeacherInclude,
    });
  },

  update: async (id: string, data: Prisma.ClassUpdateInput) => {
    return prisma.class.update({
      where: { id },
      data,
      include: classWithTeacherInclude,
    });
  },

  softDelete: async (id: string) => {
    return prisma.class.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },

  enrollStudent: async (classId: string, studentId: string, academicYear: string) => {
    return prisma.enrollment.create({
      data: {
        classId,
        studentId,
        academicYear,
      },
    });
  },

  removeEnrollment: async (classId: string, studentId: string) => {
    return prisma.enrollment.deleteMany({
      where: { classId, studentId },
    });
  },

  getEnrollments: async (classId: string) => {
    return prisma.enrollment.findMany({
      where: { classId, deletedAt: null },
      include: {
        student: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              }
            }
          }
        }
      },
      orderBy: {
        student: {
          user: {
            lastName: 'asc'
          }
        }
      }
    });
  }
};
