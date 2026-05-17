import { attendanceRepository } from './repository';
import { GetAttendanceQuery, BulkUpsertAttendanceBody } from './dtos';

export const attendanceService = {
  getByClassAndDate: async (query: GetAttendanceQuery) => {
    const date = new Date(query.date);
    return attendanceRepository.getByClassAndDate(query.classId, date);
  },

  bulkUpsert: async (data: BulkUpsertAttendanceBody) => {
    const date = new Date(data.date);
    return attendanceRepository.bulkUpsert(data.classId, date, data.records);
  },
};
