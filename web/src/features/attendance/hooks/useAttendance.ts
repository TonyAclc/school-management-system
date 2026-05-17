import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceService } from '../services/attendance.service';
import { GetAttendanceQuery, BulkUpsertAttendanceBody } from '../schemas';

const ATTENDANCE_QUERY_KEY = 'attendance';

export const useAttendance = (query: GetAttendanceQuery) => {
  return useQuery({
    queryKey: [ATTENDANCE_QUERY_KEY, query.classId, query.date],
    queryFn: () => attendanceService.getByClassAndDate(query),
    enabled: !!query.classId && !!query.date,
  });
};

export const useBulkUpsertAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BulkUpsertAttendanceBody) => attendanceService.bulkUpsert(data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [ATTENDANCE_QUERY_KEY, variables.classId, variables.date] });
    },
  });
};
