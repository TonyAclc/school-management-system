import { Request, Response } from 'express';
import { subjectsService } from './service';
import { CreateSubjectBody, UpdateSubjectBody, ListSubjectsQuery } from './dtos';

export const subjectsController = {
  list: async (req: Request, res: Response) => {
    const result = await subjectsService.list(req.query as unknown as ListSubjectsQuery);
    res.json(result);
  },

  get: async (req: Request<{ id: string }>, res: Response) => {
    const subject = await subjectsService.getById(req.params.id);
    res.json(subject);
  },

  create: async (req: Request<{}, {}, CreateSubjectBody>, res: Response) => {
    const subject = await subjectsService.create(req.body);
    res.status(201).json(subject);
  },

  update: async (req: Request<{ id: string }, {}, UpdateSubjectBody>, res: Response) => {
    const subject = await subjectsService.update(req.params.id, req.body);
    res.json(subject);
  },

  remove: async (req: Request<{ id: string }>, res: Response) => {
    await subjectsService.remove(req.params.id);
    res.status(204).end();
  },
};
