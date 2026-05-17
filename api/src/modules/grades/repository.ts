import { prisma } from '../../db/prisma';
import { Prisma } from '@prisma/client';

export const gradesRepository = {
  list: async (where: Prisma.GradeWhereInput) => {
    return prisma.grade.findMany({
      where: {
        ...where,
        deletedAt: null,
      },
      include: {
        student: {
          select: {
            id: true,
            studentNumber: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
              }
            }
          }
        },
        subject: {
          select: {
            id: true,
            code: true,
            name: true,
          }
        }
      }
    });
  },

  bulkUpsert: async (subjectId: string, academicYear: string, term: string, maxScore: number, records: { studentId: string; score: number; }[]) => {
    return prisma.$transaction(async (tx) => {
      // Delete existing records for this subject + year + term + students
      const studentIds = records.map(r => r.studentId);
      
      await tx.grade.deleteMany({
        where: {
          subjectId,
          academicYear,
          term,
          studentId: { in: studentIds },
        },
      });

      // Insert new records
      if (records.length > 0) {
        await tx.grade.createMany({
          data: records.map(r => ({
            subjectId,
            academicYear,
            term,
            studentId: r.studentId,
            score: new Prisma.Decimal(r.score),
            maxScore: new Prisma.Decimal(maxScore),
          })),
        });
      }

      return tx.grade.findMany({
        where: {
          subjectId,
          academicYear,
          term,
          studentId: { in: studentIds },
          deletedAt: null,
        },
      });
    });
  },
};
