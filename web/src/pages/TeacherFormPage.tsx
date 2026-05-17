import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router';
import { useTeacherDetail, useCreateTeacher, useUpdateTeacher } from '../features/teachers/hooks/useTeachers';
import { createTeacherFormSchema, updateTeacherFormSchema, CreateTeacherFormValues, UpdateTeacherFormValues } from '../features/teachers/schemas';
import { FormField } from '../components/FormField';
import { Input } from '../components/Input';
import { PasswordInput } from '../components/PasswordInput';
import { Button } from '../components/Button';
import { toast } from '../store/toast-store';
import { errorMessage } from '../lib/api-error';

export const TeacherFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id && id !== 'new');
  const navigate = useNavigate();

  const { data: teacher, isLoading: isTeacherLoading } = useTeacherDetail(id || '');
  const { mutateAsync: createTeacher, isPending: isCreating } = useCreateTeacher();
  const { mutateAsync: updateTeacher, isPending: isUpdating } = useUpdateTeacher(id || '');

  const schema = isEditing ? updateTeacherFormSchema : createTeacherFormSchema;
  type FormValues = CreateTeacherFormValues & UpdateTeacherFormValues;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      isActive: true,
    },
  });

  useEffect(() => {
    if (isEditing && teacher) {
      reset({
        email: teacher.user.email,
        firstName: teacher.user.firstName,
        lastName: teacher.user.lastName,
        phone: teacher.user.phone || '',
        employeeNumber: teacher.employeeNumber,
        department: teacher.department || '',
        isActive: teacher.user.isActive,
      });
    }
  }, [isEditing, teacher, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (isEditing) {
        await updateTeacher(data);
        toast.success('Teacher updated successfully');
      } else {
        await createTeacher(data as CreateTeacherFormValues);
        toast.success('Teacher created successfully');
      }
      navigate('/teachers');
    } catch (err) {
      toast.error(errorMessage(err));
    }
  });

  if (isEditing && isTeacherLoading) {
    return <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-fg-muted)' }}>Loading...</div>;
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)' }}>{isEditing ? 'Edit Teacher' : 'Add New Teacher'}</h1>
        <Button variant="ghost" onClick={() => navigate('/teachers')}>Cancel</Button>
      </div>

      <div style={{ backgroundColor: 'var(--color-bg-elevated)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
        <form onSubmit={onSubmit} noValidate>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <FormField label="First Name" htmlFor="firstName" error={errors.firstName?.message} required>
              <Input id="firstName" invalid={!!errors.firstName} {...register('firstName')} />
            </FormField>

            <FormField label="Last Name" htmlFor="lastName" error={errors.lastName?.message} required>
              <Input id="lastName" invalid={!!errors.lastName} {...register('lastName')} />
            </FormField>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <FormField label="Employee Number" htmlFor="employeeNumber" error={errors.employeeNumber?.message} required>
              <Input id="employeeNumber" invalid={!!errors.employeeNumber} {...register('employeeNumber')} />
            </FormField>

            <FormField label="Department" htmlFor="department" error={errors.department?.message}>
              <select
                id="department"
                {...register('department')}
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
                <option value="">-- Select Department --</option>
                <option value="BSIT">BSIT</option>
                <option value="BSBA">BSBA</option>
              </select>
            </FormField>
          </div>

          <FormField label="Email" htmlFor="email" error={errors.email?.message} required>
            <Input id="email" type="email" invalid={!!errors.email} {...register('email')} />
          </FormField>

          {!isEditing && (
            <FormField label="Password" htmlFor="password" error={errors.password?.message} required>
              <PasswordInput id="password" invalid={!!errors.password} {...register('password')} />
            </FormField>
          )}

          <FormField label="Phone (Optional)" htmlFor="phone" error={errors.phone?.message}>
            <Input id="phone" invalid={!!errors.phone} {...register('phone')} />
          </FormField>

          <div style={{ marginTop: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
              <input type="checkbox" {...register('isActive')} />
              <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>Active Account</span>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
            <Button type="button" variant="ghost" onClick={() => navigate('/teachers')}>Cancel</Button>
            <Button type="submit" isLoading={isCreating || isUpdating} loadingText="Saving...">
              {isEditing ? 'Save Changes' : 'Create Teacher'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
