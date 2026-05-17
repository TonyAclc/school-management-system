import { Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import { env } from '../../config/env';
import { teachersRepository } from './repository';
import { usersRepository } from '../users/repository';
import { CreateTeacherBody, UpdateTeacherBody, ListTeachersQuery } from './dtos';
import { ConflictError, NotFoundError } from '../../shared/errors/app-error';

export const teachersService = {
  list: async (query: ListTeachersQuery) => {
    const { page, pageSize, search, sortBy, sortOrder } = query;
    const skip = (page - 1) * pageSize;

    const where: Prisma.TeacherWhereInput = search
      ? {
          OR: [
            { employeeNumber: { contains: search, mode: 'insensitive' } },
            { department: { contains: search, mode: 'insensitive' } },
            { user: { firstName: { contains: search, mode: 'insensitive' } } },
            { user: { lastName: { contains: search, mode: 'insensitive' } } },
            { user: { email: { contains: search, mode: 'insensitive' } } },
          ],
        }
      : {};

    let orderBy: Prisma.TeacherOrderByWithRelationInput;
    if (sortBy === 'firstName' || sortBy === 'lastName') {
      orderBy = { user: { [sortBy]: sortOrder } };
    } else {
      orderBy = { [sortBy]: sortOrder };
    }

    const { items, totalCount } = await teachersRepository.list({
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
    const teacher = await teachersRepository.findById(id);
    if (!teacher) throw new NotFoundError('Teacher');
    return teacher;
  },

  create: async (data: CreateTeacherBody) => {
    const existingUser = await usersRepository.findByEmail(data.email);
    if (existingUser) throw new ConflictError('Email already in use');

    const existingTeacher = await teachersRepository.findByEmployeeNumber(data.employeeNumber);
    if (existingTeacher) throw new ConflictError('Employee number already in use');

    const teacherRole = await usersRepository.findRoleByName('TEACHER');
    if (!teacherRole) throw new Error('TEACHER role not found in database');

    const passwordHash = await bcrypt.hash(data.password, env.BCRYPT_ROUNDS);

    return teachersRepository.createWithUser(
      {
        employeeNumber: data.employeeNumber,
        department: data.department,
      },
      {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        isActive: true,
      },
      teacherRole.id
    );
  },

  update: async (id: string, data: UpdateTeacherBody) => {
    const teacher = await teachersRepository.findById(id);
    if (!teacher) throw new NotFoundError('Teacher');

    if (data.email && data.email !== teacher.user.email) {
      const existingUser = await usersRepository.findByEmail(data.email);
      if (existingUser) throw new ConflictError('Email already in use');
    }

    if (data.employeeNumber && data.employeeNumber !== teacher.employeeNumber) {
      const existingTeacher = await teachersRepository.findByEmployeeNumber(data.employeeNumber);
      if (existingTeacher) throw new ConflictError('Employee number already in use');
    }

    const teacherUpdate: Prisma.TeacherUpdateInput = {};
    if (data.employeeNumber !== undefined) teacherUpdate.employeeNumber = data.employeeNumber;
    if (data.department !== undefined) teacherUpdate.department = data.department;

    const userUpdate: Prisma.UserUpdateInput = {};
    if (data.email !== undefined) userUpdate.email = data.email;
    if (data.firstName !== undefined) userUpdate.firstName = data.firstName;
    if (data.lastName !== undefined) userUpdate.lastName = data.lastName;
    if (data.phone !== undefined) userUpdate.phone = data.phone;
    if (data.isActive !== undefined) userUpdate.isActive = data.isActive;

    return teachersRepository.update(id, teacherUpdate, userUpdate);
  },

  remove: async (id: string) => {
    const teacher = await teachersRepository.findById(id);
    if (!teacher) throw new NotFoundError('Teacher');

    await teachersRepository.softDelete(id, teacher.userId);
  },
};
