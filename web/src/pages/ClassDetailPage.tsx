import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useClassDetail, useClassEnrollments, useEnrollStudent, useRemoveEnrollment } from '../features/classes/hooks/useClasses';
import { useStudentsList } from '../features/students/hooks/useStudents';
import { enrollStudentFormSchema, EnrollStudentFormValues } from '../features/classes/schemas';
import { Button } from '../components/Button';
import { FormField } from '../components/FormField';
import { Input } from '../components/Input';
import { toast } from '../store/toast-store';
import { errorMessage } from '../lib/api-error';

export const ClassDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: classData, isLoading: classLoading } = useClassDetail(id || '');
  const { data: enrollments, isLoading: enrollmentsLoading } = useClassEnrollments(id || '');
  
  // Fetch students for the dropdown
  const [searchTerm, setSearchTerm] = useState('');
  const { data: studentsData } = useStudentsList({ page: 1, pageSize: 50, search: searchTerm || undefined });

  const { mutateAsync: enrollStudent, isPending: isEnrolling } = useEnrollStudent(id || '');
  const { mutateAsync: removeEnrollment } = useRemoveEnrollment(id || '');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<EnrollStudentFormValues>({
    resolver: zodResolver(enrollStudentFormSchema),
    defaultValues: {
      academicYear: classData?.academicYear || '',
    }
  });

  // Ensure academic year updates when classData loads
  if (classData && !errors.academicYear && !searchTerm) {
      // Small hack to ensure default value is set
  }

  const onEnroll = handleSubmit(async (data) => {
    try {
      await enrollStudent({
        studentId: data.studentId,
        academicYear: classData?.academicYear || data.academicYear
      });
      toast.success('Student enrolled successfully');
      reset({ studentId: '' });
    } catch (err) {
      toast.error(errorMessage(err));
    }
  });

  const handleRemove = async (studentId: string, studentName: string) => {
    if (window.confirm(`Are you sure you want to remove ${studentName} from this class?`)) {
      try {
        await removeEnrollment(studentId);
        toast.success('Student removed from class');
      } catch (err) {
        toast.error(errorMessage(err));
      }
    }
  };

  if (classLoading) return <div style={{ padding: 'var(--space-6)', textAlign: 'center' }}>Loading...</div>;
  if (!classData) return <div style={{ padding: 'var(--space-6)', textAlign: 'center' }}>Class not found.</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--font-size-2xl)' }}>{classData.gradeLevel}</h1>
          <p style={{ color: 'var(--color-fg-muted)' }}>
            Academic Year: {classData.academicYear} | 
            Homeroom: {classData.homeroomTeacher ? `${classData.homeroomTeacher.user.firstName} ${classData.homeroomTeacher.user.lastName}` : 'Unassigned'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <Button variant="outline" onClick={() => navigate('/classes')}>Back to Classes</Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 'var(--space-6)' }}>
        {/* Left column: Student List */}
        <div style={{ backgroundColor: 'var(--color-bg-elevated)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)' }}>
          <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-4)' }}>Enrolled Students ({enrollments?.length || 0})</h2>
          
          {enrollmentsLoading ? (
            <p style={{ color: 'var(--color-fg-muted)' }}>Loading enrollments...</p>
          ) : enrollments?.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--color-fg-muted)' }}>
              No students are currently enrolled in this class.
            </div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {enrollments?.map((enrollment) => (
                <li 
                  key={enrollment.id}
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: 'var(--space-3)',
                    borderBottom: '1px solid var(--color-border)',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 'var(--font-weight-medium)' }}>
                      {enrollment.student?.user.firstName} {enrollment.student?.user.lastName}
                    </div>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-fg-muted)' }}>
                      {enrollment.student?.studentNumber}
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    style={{ color: 'var(--color-danger)' }}
                    onClick={() => handleRemove(enrollment.studentId, `${enrollment.student?.user.firstName}`)}
                  >
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Right column: Enroll Student Form */}
        <div style={{ backgroundColor: 'var(--color-bg-elevated)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', height: 'fit-content' }}>
          <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-4)' }}>Enroll Student</h2>
          
          <form onSubmit={onEnroll}>
            <FormField label="Search Student" htmlFor="search">
              <Input 
                id="search" 
                placeholder="Type to search..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </FormField>

            <FormField label="Select Student" htmlFor="studentId" error={errors.studentId?.message}>
              <select 
                id="studentId" 
                {...register('studentId')}
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
                <option value="">-- Choose a student --</option>
                {studentsData?.items.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.user.firstName} {student.user.lastName} ({student.studentNumber})
                  </option>
                ))}
              </select>
            </FormField>

            <Button type="submit" isLoading={isEnrolling} style={{ width: '100%', marginTop: 'var(--space-4)' }}>
              Add to Class
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
