import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router';
import { useClassDetail, useCreateClass, useUpdateClass } from '../features/classes/hooks/useClasses';
import { useTeachersList } from '../features/teachers/hooks/useTeachers';
import { createClassFormSchema, updateClassFormSchema, CreateClassFormValues, UpdateClassFormValues } from '../features/classes/schemas';
import { FormField } from '../components/FormField';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { toast } from '../store/toast-store';
import { errorMessage } from '../lib/api-error';

export const ClassFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id && id !== 'new');
  const navigate = useNavigate();

  const { data: classData, isLoading: isClassLoading } = useClassDetail(id || '');
  const { data: teachersData } = useTeachersList({ page: 1, pageSize: 100 });
  
  const { mutateAsync: createClass, isPending: isCreating } = useCreateClass();
  const { mutateAsync: updateClass, isPending: isUpdating } = useUpdateClass(id || '');

  const schema = isEditing ? updateClassFormSchema : createClassFormSchema;
  type FormValues = CreateClassFormValues & UpdateClassFormValues;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      academicYear: new Date().getFullYear().toString() + '-' + (new Date().getFullYear() + 1).toString(),
    }
  });

  useEffect(() => {
    if (isEditing && classData) {
      reset({
        gradeLevel: classData.gradeLevel,
        academicYear: classData.academicYear,
        homeroomTeacherId: classData.homeroomTeacherId || '',
      });
    }
  }, [isEditing, classData, reset]);

  const onSubmit = handleSubmit(async (data) => {
    const payload = {
      ...data,
      homeroomTeacherId: data.homeroomTeacherId === '' ? null : data.homeroomTeacherId,
    };

    try {
      if (isEditing) {
        await updateClass(payload);
        toast.success('Class updated successfully');
      } else {
        await createClass(payload as CreateClassFormValues);
        toast.success('Class created successfully');
      }
      navigate('/classes');
    } catch (err) {
      toast.error(errorMessage(err));
    }
  });

  if (isEditing && isClassLoading) {
    return <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-fg-muted)' }}>Loading...</div>;
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)' }}>{isEditing ? 'Edit Class' : 'Add New Class'}</h1>
        <Button variant="ghost" onClick={() => navigate('/classes')}>Cancel</Button>
      </div>

      <div style={{ backgroundColor: 'var(--color-bg-elevated)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
        <form onSubmit={onSubmit} noValidate>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <FormField label="Course / Section" htmlFor="gradeLevel" error={errors.gradeLevel?.message} required>
              <Input id="gradeLevel" placeholder="BSIT-1A" invalid={!!errors.gradeLevel} {...register('gradeLevel')} />
            </FormField>

            <FormField label="Academic Year" htmlFor="academicYear" error={errors.academicYear?.message} required>
              <Input id="academicYear" placeholder="2026-2027" invalid={!!errors.academicYear} {...register('academicYear')} />
            </FormField>
          </div>

          <FormField label="Course Adviser (Optional)" htmlFor="homeroomTeacherId" error={errors.homeroomTeacherId?.message}>
            <select 
              id="homeroomTeacherId" 
              {...register('homeroomTeacherId')}
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
              <option value="">-- Unassigned --</option>
              {teachersData?.items.map(teacher => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.user.firstName} {teacher.user.lastName} ({teacher.employeeNumber})
                </option>
              ))}
            </select>
          </FormField>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
            <Button type="button" variant="ghost" onClick={() => navigate('/classes')}>Cancel</Button>
            <Button type="submit" isLoading={isCreating || isUpdating} loadingText="Saving...">
              {isEditing ? 'Save Changes' : 'Create Class'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
