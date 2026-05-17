import { Prisma } from '@prisma/client';
import { gradesRepository } from './repository';
import { GetGradesQuery, BulkUpsertGradesBody } from './dtos';

export const gradesService = {
  list: async (query: GetGradesQuery) => {
    const where: Prisma.GradeWhereInput = {};
    if (query.subjectId) where.subjectId = query.subjectId;
    if (query.studentId) where.studentId = query.studentId;
    if (query.academicYear) where.academicYear = query.academicYear;
    if (query.term) where.term = query.term;

    return gradesRepository.list(where);
  },

  bulkUpsert: async (data: BulkUpsertGradesBody) => {
    return gradesRepository.bulkUpsert(
      data.subjectId,
      data.academicYear,
      data.term,
      data.maxScore,
      data.records
    );
  },
};
