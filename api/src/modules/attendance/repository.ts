import { prisma } from '../../db/prisma';
import { Prisma, AttendanceStatus } from '@prisma/client';

export const attendanceRepository = {
  getByClassAndDate: async (classId: string, date: Date) => {
    return prisma.attendance.findMany({
      where: {
        classId,
        date,
        deletedAt: null,
      },
    });
  },

  bulkUpsert: async (classId: string, date: Date, records: { studentId: string; status: AttendanceStatus; notes?: string | null }[]) => {
    return prisma.$transaction(async (tx) => {
      // Because Prisma doesn't natively support bulk upsert with multiple unique constraints easily without raw queries,
      // and this is relatively small batch, we will delete existing and insert new for the class + date.
      
      // Delete existing records for this class and date
      await tx.attendance.deleteMany({
        where: {
          classId,
          date,
        },
      });

      // Insert the new records
      if (records.length > 0) {
        await tx.attendance.createMany({
          data: records.map(r => ({
            classId,
            date,
            studentId: r.studentId,
            status: r.status,
            notes: r.notes || null,
          })),
        });
      }

      // Fetch and return the newly created records
      return tx.attendance.findMany({
        where: {
          classId,
          date,
          deletedAt: null,
        },
      });
    });
  },
};
