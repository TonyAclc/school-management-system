import { Prisma } from '@prisma/client';
import { classesRepository } from './repository';
import { CreateClassBody, UpdateClassBody, ListClassesQuery, EnrollStudentBody } from './dtos';
import { ConflictError, NotFoundError } from '../../shared/errors/app-error';
import { prisma } from '../../db/prisma';

export const classesService = {
  list: async (query: ListClassesQuery) => {
    const { page, pageSize, search, sortBy, sortOrder } = query;
    const skip = (page - 1) * pageSize;

    const where: Prisma.ClassWhereInput = search
      ? {
          OR: [
            { gradeLevel: { contains: search, mode: 'insensitive' } },
            { academicYear: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const orderBy: Prisma.ClassOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    const { items, totalCount } = await classesRepository.list({
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
    const classData = await classesRepository.findById(id);
    if (!classData) throw new NotFoundError('Class');
    return classData;
  },

  create: async (data: CreateClassBody) => {
    return classesRepository.create(data);
  },

  update: async (id: string, data: UpdateClassBody) => {
    const classData = await classesRepository.findById(id);
    if (!classData) throw new NotFoundError('Class');

    return classesRepository.update(id, data);
  },

  remove: async (id: string) => {
    const classData = await classesRepository.findById(id);
    if (!classData) throw new NotFoundError('Class');

    await classesRepository.softDelete(id);
  },

  getEnrollments: async (id: string) => {
    const classData = await classesRepository.findById(id);
    if (!classData) throw new NotFoundError('Class');
    return classesRepository.getEnrollments(id);
  },

  enrollStudent: async (classId: string, data: EnrollStudentBody) => {
    const classData = await classesRepository.findById(classId);
    if (!classData) throw new NotFoundError('Class');

    // Check if student exists
    const student = await prisma.student.findUnique({ where: { id: data.studentId } });
    if (!student) throw new NotFoundError('Student');

    // Check if already enrolled in this class for the year
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_classId_academicYear: {
          studentId: data.studentId,
          classId,
          academicYear: data.academicYear,
        }
      }
    });

    if (existingEnrollment) {
      throw new ConflictError('Student is already enrolled in this class for the academic year');
    }

    return classesRepository.enrollStudent(classId, data.studentId, data.academicYear);
  },

  removeEnrollment: async (classId: string, studentId: string) => {
    await classesRepository.removeEnrollment(classId, studentId);
  }
};
