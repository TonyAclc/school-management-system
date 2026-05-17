import { Request, Response } from 'express';
import { gradesService } from './service';
import { GetGradesQuery, BulkUpsertGradesBody } from './dtos';

export const gradesController = {
  get: async (req: Request, res: Response) => {
    const result = await gradesService.list(req.query as unknown as GetGradesQuery);
    res.json(result);
  },

  bulkUpsert: async (req: Request<{}, {}, BulkUpsertGradesBody>, res: Response) => {
    const result = await gradesService.bulkUpsert(req.body);
    res.json(result);
  },
};
