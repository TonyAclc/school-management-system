import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { classesService } from '../services/classes.service';
import { ListClassesQuery, CreateClassFormValues, UpdateClassFormValues, EnrollStudentFormValues } from '../schemas';

const CLASSES_QUERY_KEY = 'classes';
const ENROLLMENTS_QUERY_KEY = 'enrollments';

export const useClassesList = (query: ListClassesQuery) => {
  return useQuery({
    queryKey: [CLASSES_QUERY_KEY, query],
    queryFn: () => classesService.list(query),
  });
};

export const useClassDetail = (id: string) => {
  return useQuery({
    queryKey: [CLASSES_QUERY_KEY, id],
    queryFn: () => classesService.getById(id),
    enabled: !!id && id !== 'new',
  });
};

export const useCreateClass = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateClassFormValues) => classesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CLASSES_QUERY_KEY] });
    },
  });
};

export const useUpdateClass = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateClassFormValues) => classesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CLASSES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [CLASSES_QUERY_KEY, id] });
    },
  });
};

export const useDeleteClass = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => classesService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CLASSES_QUERY_KEY] });
    },
  });
};

export const useClassEnrollments = (id: string) => {
  return useQuery({
    queryKey: [ENROLLMENTS_QUERY_KEY, id],
    queryFn: () => classesService.getEnrollments(id),
    enabled: !!id && id !== 'new',
  });
};

export const useEnrollStudent = (classId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: EnrollStudentFormValues) => classesService.enrollStudent(classId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ENROLLMENTS_QUERY_KEY, classId] });
      queryClient.invalidateQueries({ queryKey: [CLASSES_QUERY_KEY] });
    },
  });
};

export const useRemoveEnrollment = (classId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (studentId: string) => classesService.removeEnrollment(classId, studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ENROLLMENTS_QUERY_KEY, classId] });
      queryClient.invalidateQueries({ queryKey: [CLASSES_QUERY_KEY] });
    },
  });
};
