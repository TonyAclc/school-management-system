import { Request, Response } from 'express';
import { studentsService } from './service';
import { CreateStudentBody, UpdateStudentBody, ListStudentsQuery } from './dtos';

export const studentsController = {
  list: async (req: Request, res: Response) => {
    const result = await studentsService.list(req.query as unknown as ListStudentsQuery);
    res.json(result);
  },

  get: async (req: Request<{ id: string }>, res: Response) => {
    const student = await studentsService.getById(req.params.id);
    res.json(student);
  },

  create: async (req: Request<{}, {}, CreateStudentBody>, res: Response) => {
    const student = await studentsService.create(req.body);
    res.status(201).json(student);
  },

  update: async (req: Request<{ id: string }, {}, UpdateStudentBody>, res: Response) => {
    const student = await studentsService.update(req.params.id, req.body);
    res.json(student);
  },

  remove: async (req: Request<{ id: string }>, res: Response) => {
    await studentsService.remove(req.params.id);
    res.status(204).end();
  },
};
