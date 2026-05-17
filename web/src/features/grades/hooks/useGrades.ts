import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gradesService } from '../services/grades.service';
import { GetGradesQuery, BulkUpsertGradesBody } from '../schemas';

const GRADES_QUERY_KEY = 'grades';

export const useGrades = (query: GetGradesQuery) => {
  return useQuery({
    queryKey: [GRADES_QUERY_KEY, query],
    queryFn: () => gradesService.list(query),
    enabled: Object.values(query).some(v => !!v), // Only run if at least one parameter is provided
  });
};

export const useBulkUpsertGrades = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BulkUpsertGradesBody) => gradesService.bulkUpsert(data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [GRADES_QUERY_KEY] });
    },
  });
};
