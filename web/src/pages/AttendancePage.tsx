import { useState, useEffect } from 'react';
import { useClassesList, useClassEnrollments } from '../features/classes/hooks/useClasses';
import { useAttendance, useBulkUpsertAttendance } from '../features/attendance/hooks/useAttendance';
import { Button } from '../components/Button';
import { FormField } from '../components/FormField';
import { Input } from '../components/Input';
import { toast } from '../store/toast-store';
import { errorMessage } from '../lib/api-error';
import { z } from 'zod';

export const AttendancePage = () => {
  const [selectedClass, setSelectedClass] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Fetch all classes for the dropdown
  const { data: classesData, isLoading: classesLoading } = useClassesList({ page: 1, pageSize: 100, sortBy: 'gradeLevel', sortOrder: 'asc' });
  
  // Fetch enrolled students for the selected class
  const { data: enrollments, isLoading: enrollmentsLoading } = useClassEnrollments(selectedClass);
  
  // Fetch existing attendance records for the selected class & date
  const { data: attendanceData, isLoading: attendanceLoading } = useAttendance({ classId: selectedClass, date });

  // Mutation to save
  const { mutateAsync: saveAttendance, isPending: isSaving } = useBulkUpsertAttendance();

  // Local state for the attendance form
  // Record<studentId, { status: string, notes: string }>
  const [attendanceForm, setAttendanceForm] = useState<Record<string, { status: 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED'; notes: string }>>({});

  // Sync existing attendance data into the local form state
  useEffect(() => {
    if (enrollments && !attendanceLoading) {
      const newFormState: typeof attendanceForm = {};
      
      enrollments.forEach(enrollment => {
        // Find existing record if it exists
        const existingRecord = attendanceData?.find(a => a.studentId === enrollment.studentId);
        
        if (existingRecord) {
          newFormState[enrollment.studentId] = {
            status: existingRecord.status,
            notes: existingRecord.notes || '',
          };
        } else {
          // Default to PRESENT
          newFormState[enrollment.studentId] = {
            status: 'PRESENT',
            notes: '',
          };
        }
      });
      
      setAttendanceForm(newFormState);
    }
  }, [enrollments, attendanceData, attendanceLoading]);

  const handleStatusChange = (studentId: string, status: 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED') => {
    setAttendanceForm(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      }
    }));
  };

  const handleNotesChange = (studentId: string, notes: string) => {
    setAttendanceForm(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        notes,
      }
    }));
  };

  const handleSave = async () => {
    if (!selectedClass || !date) return;

    const records = Object.entries(attendanceForm).map(([studentId, data]) => ({
      studentId,
      status: data.status,
      notes: data.notes || null,
    }));

    try {
      await saveAttendance({
        classId: selectedClass,
        date,
        records,
      });
      toast.success('Attendance saved successfully');
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const markAllAs = (status: 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED') => {
    setAttendanceForm(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(studentId => {
        next[studentId].status = status;
      });
      return next;
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)' }}>Attendance</h1>
      </div>

      {/* Controls Container */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', backgroundColor: 'var(--color-bg-elevated)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-6)' }}>
        <FormField label="Select Class" htmlFor="classId">
          {classesLoading ? (
            <p>Loading classes...</p>
          ) : (
            <select 
              id="classId" 
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              style={{
                width: '100%',
                padding: 'var(--space-2) var(--space-3)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-bg)',
                fontSize: 'var(--font-size-md)',
                color: 'var(--color-fg)',
              }}
            >
              <option value="">-- Choose a class --</option>
              {classesData?.items.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.gradeLevel} ({cls.academicYear})
                </option>
              ))}
            </select>
          )}
        </FormField>

        <FormField label="Date" htmlFor="date">
          <Input 
            id="date" 
            type="date" 
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </FormField>
      </div>

      {/* Attendance Form */}
      {selectedClass && (
        <div style={{ backgroundColor: 'var(--color-bg-elevated)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)' }}>
          {enrollmentsLoading || attendanceLoading ? (
            <p style={{ textAlign: 'center', color: 'var(--color-fg-muted)', padding: 'var(--space-6)' }}>Loading student records...</p>
          ) : enrollments?.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--color-fg-muted)', padding: 'var(--space-6)' }}>No students enrolled in this class.</p>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                <h2 style={{ fontSize: 'var(--font-size-lg)' }}>Enrolled Students ({enrollments?.length})</h2>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <Button variant="secondary" size="sm" onClick={() => markAllAs('PRESENT')}>Mark All Present</Button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {enrollments?.map(enrollment => {
                  const studentId = enrollment.studentId;
                  const record = attendanceForm[studentId] || { status: 'PRESENT', notes: '' };
                  const studentName = `${enrollment.student?.user.firstName} ${enrollment.student?.user.lastName}`;
                  
                  return (
                    <div key={studentId} style={{ display: 'grid', gridTemplateColumns: '250px auto 1fr', gap: 'var(--space-4)', alignItems: 'center', padding: 'var(--space-3)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                      <div>
                        <div style={{ fontWeight: 'var(--font-weight-medium)' }}>{studentName}</div>
                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-fg-muted)' }}>{enrollment.student?.studentNumber}</div>
                      </div>

                      <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                        {(['PRESENT', 'LATE', 'ABSENT', 'EXCUSED'] as const).map(status => (
                          <label key={status} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
                            <input 
                              type="radio" 
                              name={`status-${studentId}`} 
                              value={status} 
                              checked={record.status === status}
                              onChange={() => handleStatusChange(studentId, status)}
                            />
                            <span style={{ 
                              fontSize: 'var(--font-size-sm)',
                              color: 
                                status === 'PRESENT' ? 'var(--color-success)' : 
                                status === 'ABSENT' ? 'var(--color-danger)' : 
                                status === 'LATE' ? 'var(--color-warning)' : 'var(--color-fg)'
                            }}>
                              {status.charAt(0) + status.slice(1).toLowerCase()}
                            </span>
                          </label>
                        ))}
                      </div>

                      <div>
                        <Input 
                          placeholder="Notes (optional)" 
                          value={record.notes}
                          onChange={(e) => handleNotesChange(studentId, e.target.value)}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-6)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)' }}>
                <Button onClick={handleSave} isLoading={isSaving} size="lg">
                  Save Attendance
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
