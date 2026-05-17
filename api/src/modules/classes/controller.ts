import { Request, Response } from 'express';
import { classesService } from './service';
import { CreateClassBody, UpdateClassBody, ListClassesQuery, EnrollStudentBody } from './dtos';

export const classesController = {
  list: async (req: Request, res: Response) => {
    const result = await classesService.list(req.query as unknown as ListClassesQuery);
    res.json(result);
  },

  get: async (req: Request<{ id: string }>, res: Response) => {
    const classData = await classesService.getById(req.params.id);
    res.json(classData);
  },

  create: async (req: Request<{}, {}, CreateClassBody>, res: Response) => {
    const classData = await classesService.create(req.body);
    res.status(201).json(classData);
  },

  update: async (req: Request<{ id: string }, {}, UpdateClassBody>, res: Response) => {
    const classData = await classesService.update(req.params.id, req.body);
    res.json(classData);
  },

  remove: async (req: Request<{ id: string }>, res: Response) => {
    await classesService.remove(req.params.id);
    res.status(204).end();
  },

  getEnrollments: async (req: Request<{ id: string }>, res: Response) => {
    const enrollments = await classesService.getEnrollments(req.params.id);
    res.json(enrollments);
  },

  enrollStudent: async (req: Request<{ id: string }, {}, EnrollStudentBody>, res: Response) => {
    const enrollment = await classesService.enrollStudent(req.params.id, req.body);
    res.status(201).json(enrollment);
  },

  removeEnrollment: async (req: Request<{ id: string, studentId: string }>, res: Response) => {
    await classesService.removeEnrollment(req.params.id, req.params.studentId);
    res.status(204).end();
  }
};
