import { Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import { env } from '../../config/env';
import { studentsRepository } from './repository';
import { usersRepository } from '../users/repository';
import { CreateStudentBody, UpdateStudentBody, ListStudentsQuery } from './dtos';
import { ConflictError, NotFoundError } from '../../shared/errors/app-error';

export const studentsService = {
  list: async (query: ListStudentsQuery) => {
    const { page, pageSize, search, sortBy, sortOrder } = query;
    const skip = (page - 1) * pageSize;

    const where: Prisma.StudentWhereInput = search
      ? {
          OR: [
            { studentNumber: { contains: search, mode: 'insensitive' } },
            { user: { firstName: { contains: search, mode: 'insensitive' } } },
            { user: { lastName: { contains: search, mode: 'insensitive' } } },
            { user: { email: { contains: search, mode: 'insensitive' } } },
          ],
        }
      : {};

    let orderBy: Prisma.StudentOrderByWithRelationInput;
    if (sortBy === 'firstName' || sortBy === 'lastName') {
      orderBy = { user: { [sortBy]: sortOrder } };
    } else {
      orderBy = { [sortBy]: sortOrder };
    }

    const { items, totalCount } = await studentsRepository.list({
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
    const student = await studentsRepository.findById(id);
    if (!student) throw new NotFoundError('Student');
    return student;
  },

  create: async (data: CreateStudentBody) => {
    // Check email uniqueness
    const existingUser = await usersRepository.findByEmail(data.email);
    if (existingUser) throw new ConflictError('Email already in use');

    // Check student number uniqueness
    const existingStudent = await studentsRepository.findByStudentNumber(data.studentNumber);
    if (existingStudent) throw new ConflictError('Student number already in use');

    // Get STUDENT role ID
    const studentRole = await usersRepository.findRoleByName('STUDENT');
    if (!studentRole) throw new Error('STUDENT role not found in database');

    const passwordHash = await bcrypt.hash(data.password, env.BCRYPT_ROUNDS);

    return studentsRepository.createWithUser(
      {
        studentNumber: data.studentNumber,
        guardianName: data.guardianName,
        guardianPhone: data.guardianPhone,
        guardianEmail: data.guardianEmail,
      },
      {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        isActive: true,
      },
      studentRole.id
    );
  },

  update: async (id: string, data: UpdateStudentBody) => {
    const student = await studentsRepository.findById(id);
    if (!student) throw new NotFoundError('Student');

    // Check email uniqueness if changed
    if (data.email && data.email !== student.user.email) {
      const existingUser = await usersRepository.findByEmail(data.email);
      if (existingUser) throw new ConflictError('Email already in use');
    }

    // Check student number uniqueness if changed
    if (data.studentNumber && data.studentNumber !== student.studentNumber) {
      const existingStudent = await studentsRepository.findByStudentNumber(data.studentNumber);
      if (existingStudent) throw new ConflictError('Student number already in use');
    }

    const studentUpdate: Prisma.StudentUpdateInput = {};
    if (data.studentNumber !== undefined) studentUpdate.studentNumber = data.studentNumber;
    if (data.guardianName !== undefined) studentUpdate.guardianName = data.guardianName;
    if (data.guardianPhone !== undefined) studentUpdate.guardianPhone = data.guardianPhone;
    if (data.guardianEmail !== undefined) studentUpdate.guardianEmail = data.guardianEmail;

    const userUpdate: Prisma.UserUpdateInput = {};
    if (data.email !== undefined) userUpdate.email = data.email;
    if (data.firstName !== undefined) userUpdate.firstName = data.firstName;
    if (data.lastName !== undefined) userUpdate.lastName = data.lastName;
    if (data.phone !== undefined) userUpdate.phone = data.phone;
    if (data.isActive !== undefined) userUpdate.isActive = data.isActive;

    return studentsRepository.update(id, studentUpdate, userUpdate);
  },

  remove: async (id: string) => {
    const student = await studentsRepository.findById(id);
    if (!student) throw new NotFoundError('Student');

    await studentsRepository.softDelete(id, student.userId);
  },
};
