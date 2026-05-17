import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router';
import { useStudentDetail, useCreateStudent, useUpdateStudent } from '../features/students/hooks/useStudents';
import { createStudentFormSchema, updateStudentFormSchema, CreateStudentFormValues, UpdateStudentFormValues } from '../features/students/schemas';
import { FormField } from '../components/FormField';
import { Input } from '../components/Input';
import { PasswordInput } from '../components/PasswordInput';
import { Button } from '../components/Button';
import { toast } from '../store/toast-store';
import { errorMessage } from '../lib/api-error';

export const StudentFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id && id !== 'new');
  const navigate = useNavigate();

  const { data: student, isLoading: isStudentLoading } = useStudentDetail(id || '');
  const { mutateAsync: createStudent, isPending: isCreating } = useCreateStudent();
  const { mutateAsync: updateStudent, isPending: isUpdating } = useUpdateStudent(id || '');

  const schema = isEditing ? updateStudentFormSchema : createStudentFormSchema;
  type FormValues = CreateStudentFormValues & UpdateStudentFormValues;

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
    if (isEditing && student) {
      reset({
        email: student.user.email,
        firstName: student.user.firstName,
        lastName: student.user.lastName,
        phone: student.user.phone || '',
        studentNumber: student.studentNumber,
        guardianName: student.guardianName || '',
        guardianPhone: student.guardianPhone || '',
        guardianEmail: student.guardianEmail || '',
        isActive: student.user.isActive,
      });
    }
  }, [isEditing, student, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (isEditing) {
        await updateStudent(data);
        toast.success('Student updated successfully');
      } else {
        await createStudent(data as CreateStudentFormValues);
        toast.success('Student created successfully');
      }
      navigate('/students');
    } catch (err) {
      toast.error(errorMessage(err));
    }
  });

  if (isEditing && isStudentLoading) {
    return <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-fg-muted)' }}>Loading...</div>;
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)' }}>{isEditing ? 'Edit Student' : 'Add New Student'}</h1>
        <Button variant="ghost" onClick={() => navigate('/students')}>Cancel</Button>
      </div>

      <div style={{ backgroundColor: 'var(--color-bg-elevated)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
        <form onSubmit={onSubmit} noValidate>
          <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-4)' }}>Student Details</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <FormField label="First Name" htmlFor="firstName" error={errors.firstName?.message} required>
              <Input id="firstName" placeholder="John" invalid={!!errors.firstName} {...register('firstName')} />
            </FormField>

            <FormField label="Last Name" htmlFor="lastName" error={errors.lastName?.message} required>
              <Input id="lastName" placeholder="Doe" invalid={!!errors.lastName} {...register('lastName')} />
            </FormField>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <FormField label="Student Number" htmlFor="studentNumber" error={errors.studentNumber?.message} required>
              <Input id="studentNumber" placeholder="STU-2026-001" invalid={!!errors.studentNumber} {...register('studentNumber')} />
            </FormField>

            <FormField label="Email" htmlFor="email" error={errors.email?.message} required>
              <Input id="email" type="email" placeholder="john.doe@example.com" invalid={!!errors.email} {...register('email')} />
            </FormField>
          </div>

          {!isEditing && (
            <FormField label="Password" htmlFor="password" error={errors.password?.message} required>
              <PasswordInput id="password" placeholder="••••••••" invalid={!!errors.password} {...register('password')} />
            </FormField>
          )}

          <FormField label="Student Phone (Optional)" htmlFor="phone" error={errors.phone?.message}>
            <Input id="phone" placeholder="+1234567890" invalid={!!errors.phone} {...register('phone')} />
          </FormField>

          <hr style={{ margin: 'var(--space-6) 0', border: 'none', borderTop: '1px solid var(--color-bg-muted)' }} />

          <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-4)' }}>Guardian Details</h2>
          <FormField label="Guardian Name" htmlFor="guardianName" error={errors.guardianName?.message}>
            <Input id="guardianName" placeholder="Jane Doe" invalid={!!errors.guardianName} {...register('guardianName')} />
          </FormField>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <FormField label="Guardian Phone" htmlFor="guardianPhone" error={errors.guardianPhone?.message}>
              <Input id="guardianPhone" placeholder="+1234567890" invalid={!!errors.guardianPhone} {...register('guardianPhone')} />
            </FormField>

            <FormField label="Guardian Email" htmlFor="guardianEmail" error={errors.guardianEmail?.message}>
              <Input id="guardianEmail" type="email" placeholder="jane.doe@example.com" invalid={!!errors.guardianEmail} {...register('guardianEmail')} />
            </FormField>
          </div>

          <div style={{ marginTop: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
              <input type="checkbox" {...register('isActive')} />
              <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>Active Account</span>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
            <Button type="button" variant="ghost" onClick={() => navigate('/students')}>Cancel</Button>
            <Button type="submit" isLoading={isCreating || isUpdating} loadingText="Saving...">
              {isEditing ? 'Save Changes' : 'Create Student'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
