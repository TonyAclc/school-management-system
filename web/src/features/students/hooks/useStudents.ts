import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentsService } from '../services/students.service';
import { ListStudentsQuery, CreateStudentFormValues, UpdateStudentFormValues } from '../schemas';

const STUDENTS_QUERY_KEY = 'students';

export const useStudentsList = (query: ListStudentsQuery) => {
  return useQuery({
    queryKey: [STUDENTS_QUERY_KEY, query],
    queryFn: () => studentsService.list(query),
  });
};

export const useStudentDetail = (id: string) => {
  return useQuery({
    queryKey: [STUDENTS_QUERY_KEY, id],
    queryFn: () => studentsService.getById(id),
    enabled: !!id && id !== 'new',
  });
};

export const useCreateStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateStudentFormValues) => studentsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STUDENTS_QUERY_KEY] });
    },
  });
};

export const useUpdateStudent = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateStudentFormValues) => studentsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STUDENTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [STUDENTS_QUERY_KEY, id] });
    },
  });
};

export const useDeleteStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => studentsService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STUDENTS_QUERY_KEY] });
    },
  });
};
