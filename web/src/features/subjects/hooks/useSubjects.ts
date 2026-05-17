import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subjectsService } from '../services/subjects.service';
import { ListSubjectsQuery, CreateSubjectFormValues, UpdateSubjectFormValues } from '../schemas';

const SUBJECTS_QUERY_KEY = 'subjects';

export const useSubjectsList = (query: ListSubjectsQuery) => {
  return useQuery({
    queryKey: [SUBJECTS_QUERY_KEY, query],
    queryFn: () => subjectsService.list(query),
  });
};

export const useSubjectDetail = (id: string) => {
  return useQuery({
    queryKey: [SUBJECTS_QUERY_KEY, id],
    queryFn: () => subjectsService.getById(id),
    enabled: !!id && id !== 'new',
  });
};

export const useCreateSubject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSubjectFormValues) => subjectsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SUBJECTS_QUERY_KEY] });
    },
  });
};

export const useUpdateSubject = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateSubjectFormValues) => subjectsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SUBJECTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [SUBJECTS_QUERY_KEY, id] });
    },
  });
};

export const useDeleteSubject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => subjectsService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SUBJECTS_QUERY_KEY] });
    },
  });
};
