import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router';
import { useSubjectDetail, useCreateSubject, useUpdateSubject } from '../features/subjects/hooks/useSubjects';
import { useTeachersList } from '../features/teachers/hooks/useTeachers';
import { createSubjectFormSchema, updateSubjectFormSchema, CreateSubjectFormValues, UpdateSubjectFormValues } from '../features/subjects/schemas';
import { FormField } from '../components/FormField';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { toast } from '../store/toast-store';
import { errorMessage } from '../lib/api-error';

export const SubjectFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id && id !== 'new');
  const navigate = useNavigate();

  const { data: subject, isLoading: isSubjectLoading } = useSubjectDetail(id || '');
  const { data: teachersData } = useTeachersList({ page: 1, pageSize: 100 }); // Simple list for dropdown
  
  const { mutateAsync: createSubject, isPending: isCreating } = useCreateSubject();
  const { mutateAsync: updateSubject, isPending: isUpdating } = useUpdateSubject(id || '');

  const schema = isEditing ? updateSubjectFormSchema : createSubjectFormSchema;
  type FormValues = CreateSubjectFormValues & UpdateSubjectFormValues;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (isEditing && subject) {
      reset({
        code: subject.code,
        name: subject.name,
        teacherId: subject.teacherId || '',
      });
    }
  }, [isEditing, subject, reset]);

  const onSubmit = handleSubmit(async (data) => {
    // Map empty string back to null for teacherId
    const payload = {
      ...data,
      teacherId: data.teacherId === '' ? null : data.teacherId,
    };

    try {
      if (isEditing) {
        await updateSubject(payload);
        toast.success('Subject updated successfully');
      } else {
        await createSubject(payload as CreateSubjectFormValues);
        toast.success('Subject created successfully');
      }
      navigate('/subjects');
    } catch (err) {
      toast.error(errorMessage(err));
    }
  });

  if (isEditing && isSubjectLoading) {
    return <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-fg-muted)' }}>Loading...</div>;
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)' }}>{isEditing ? 'Edit Subject' : 'Add New Subject'}</h1>
        <Button variant="ghost" onClick={() => navigate('/subjects')}>Cancel</Button>
      </div>

      <div style={{ backgroundColor: 'var(--color-bg-elevated)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
        <form onSubmit={onSubmit} noValidate>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--space-4)' }}>
            <FormField label="Subject Code" htmlFor="code" error={errors.code?.message} required>
              <Input id="code" placeholder="MATH101" invalid={!!errors.code} {...register('code')} />
            </FormField>

            <FormField label="Subject Name" htmlFor="name" error={errors.name?.message} required>
              <Input id="name" placeholder="Introduction to Mathematics" invalid={!!errors.name} {...register('name')} />
            </FormField>
          </div>

          <FormField label="Assigned Teacher (Optional)" htmlFor="teacherId" error={errors.teacherId?.message}>
            <select 
              id="teacherId" 
              {...register('teacherId')}
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
            <Button type="button" variant="ghost" onClick={() => navigate('/subjects')}>Cancel</Button>
            <Button type="submit" isLoading={isCreating || isUpdating} loadingText="Saving...">
              {isEditing ? 'Save Changes' : 'Create Subject'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
