import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService } from '../services/users.service';
import { usersKeys } from '../../../lib/query-keys';
import { ListUsersQuery, CreateUserFormValues, UpdateUserFormValues } from '../schemas';

export const useUsersList = (query: ListUsersQuery) => {
  return useQuery({
    queryKey: usersKeys.list(query),
    queryFn: () => usersService.list(query),
    staleTime: 60 * 1000, // 1 minute
  });
};

export const useUserDetail = (id: string) => {
  return useQuery({
    queryKey: usersKeys.detail(id),
    queryFn: () => usersService.get(id),
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateUserFormValues) => usersService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
    },
  });
};

export const useUpdateUser = (id: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UpdateUserFormValues) => usersService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => usersService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
    },
  });
};
