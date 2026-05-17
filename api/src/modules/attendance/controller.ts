import { Request, Response } from 'express';
import { attendanceService } from './service';
import { GetAttendanceQuery, BulkUpsertAttendanceBody } from './dtos';

export const attendanceController = {
  get: async (req: Request, res: Response) => {
    const result = await attendanceService.getByClassAndDate(req.query as unknown as GetAttendanceQuery);
    res.json(result);
  },

  bulkUpsert: async (req: Request<{}, {}, BulkUpsertAttendanceBody>, res: Response) => {
    const result = await attendanceService.bulkUpsert(req.body);
    res.json(result);
  },
};
