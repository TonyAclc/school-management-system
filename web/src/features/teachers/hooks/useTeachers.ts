import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teachersService } from '../services/teachers.service';
import { ListTeachersQuery, CreateTeacherFormValues, UpdateTeacherFormValues } from '../schemas';

const TEACHERS_QUERY_KEY = 'teachers';

export const useTeachersList = (query: ListTeachersQuery) => {
  return useQuery({
    queryKey: [TEACHERS_QUERY_KEY, query],
    queryFn: () => teachersService.list(query),
  });
};

export const useTeacherDetail = (id: string) => {
  return useQuery({
    queryKey: [TEACHERS_QUERY_KEY, id],
    queryFn: () => teachersService.getById(id),
    enabled: !!id && id !== 'new',
  });
};

export const useCreateTeacher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTeacherFormValues) => teachersService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEACHERS_QUERY_KEY] });
    },
  });
};

export const useUpdateTeacher = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateTeacherFormValues) => teachersService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEACHERS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [TEACHERS_QUERY_KEY, id] });
    },
  });
};

export const useDeleteTeacher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => teachersService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEACHERS_QUERY_KEY] });
    },
  });
};
