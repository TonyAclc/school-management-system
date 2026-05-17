import { Prisma } from '@prisma/client';
import { subjectsRepository } from './repository';
import { CreateSubjectBody, UpdateSubjectBody, ListSubjectsQuery } from './dtos';
import { ConflictError, NotFoundError } from '../../shared/errors/app-error';

export const subjectsService = {
  list: async (query: ListSubjectsQuery) => {
    const { page, pageSize, search, sortBy, sortOrder } = query;
    const skip = (page - 1) * pageSize;

    const where: Prisma.SubjectWhereInput = search
      ? {
          OR: [
            { code: { contains: search, mode: 'insensitive' } },
            { name: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const orderBy: Prisma.SubjectOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    const { items, totalCount } = await subjectsRepository.list({
      skip,
      take: pageSize,
      where,
      orderBy,
    });

    return {
      items,
      totalCount,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    };
  },

  getById: async (id: string) => {
    const subject = await subjectsRepository.findById(id);
    if (!subject) throw new NotFoundError('Subject');
    return subject;
  },

  create: async (data: CreateSubjectBody) => {
    const existingSubject = await subjectsRepository.findByCode(data.code);
    if (existingSubject) throw new ConflictError('Subject code already exists');

    return subjectsRepository.create(data);
  },

  update: async (id: string, data: UpdateSubjectBody) => {
    const subject = await subjectsRepository.findById(id);
    if (!subject) throw new NotFoundError('Subject');

    if (data.code && data.code !== subject.code) {
      const existingSubject = await subjectsRepository.findByCode(data.code);
      if (existingSubject) throw new ConflictError('Subject code already exists');
    }

    return subjectsRepository.update(id, data);
  },

  remove: async (id: string) => {
    const subject = await subjectsRepository.findById(id);
    if (!subject) throw new NotFoundError('Subject');

    await subjectsRepository.softDelete(id);
  },
};
