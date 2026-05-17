import { Request, Response } from 'express';
import { teachersService } from './service';
import { CreateTeacherBody, UpdateTeacherBody, ListTeachersQuery } from './dtos';

export const teachersController = {
  list: async (req: Request, res: Response) => {
    const result = await teachersService.list(req.query as unknown as ListTeachersQuery);
    res.json(result);
  },

  get: async (req: Request<{ id: string }>, res: Response) => {
    const teacher = await teachersService.getById(req.params.id);
    res.json(teacher);
  },

  create: async (req: Request<{}, {}, CreateTeacherBody>, res: Response) => {
    const teacher = await teachersService.create(req.body);
    res.status(201).json(teacher);
  },

  update: async (req: Request<{ id: string }, {}, UpdateTeacherBody>, res: Response) => {
    const teacher = await teachersService.update(req.params.id, req.body);
    res.json(teacher);
  },

  remove: async (req: Request<{ id: string }>, res: Response) => {
    await teachersService.remove(req.params.id);
    res.status(204).end();
  },
};
