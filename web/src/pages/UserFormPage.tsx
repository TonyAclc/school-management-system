import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router';
import { useUserDetail, useCreateUser, useUpdateUser } from '../features/users/hooks/useUsers';
import { createFormSchema, updateFormSchema, CreateUserFormValues, UpdateUserFormValues } from '../features/users/schemas';
import { FormField } from '../components/FormField';
import { Input } from '../components/Input';
import { PasswordInput } from '../components/PasswordInput';
import { Button } from '../components/Button';
import { toast } from '../store/toast-store';
import { errorMessage } from '../lib/api-error';
import { RoleName } from '../store/auth-store';

const ROLES: RoleName[] = ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT', 'STAFF'];

export const UserFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id && id !== 'new');
  const navigate = useNavigate();

  const { data: user, isLoading: isUserLoading } = useUserDetail(id || '');
  const { mutateAsync: createUser, isPending: isCreating } = useCreateUser();
  const { mutateAsync: updateUser, isPending: isUpdating } = useUpdateUser(id || '');

  const schema = isEditing ? updateFormSchema : createFormSchema;
  type FormValues = CreateUserFormValues & UpdateUserFormValues;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      roles: ['STUDENT'],
      isActive: true,
    },
  });

  const selectedRoles = watch('roles') || [];

  useEffect(() => {
    if (isEditing && user) {
      reset({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || '',
        roles: user.roles as RoleName[],
        isActive: user.isActive,
      });
    }
  }, [isEditing, user, reset]);

  const toggleRole = (role: RoleName) => {
    const newRoles = selectedRoles.includes(role)
      ? selectedRoles.filter(r => r !== role)
      : [...selectedRoles, role];
    setValue('roles', newRoles, { shouldValidate: true, shouldDirty: true });
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (isEditing) {
        await updateUser(data);
        toast.success('User updated successfully');
      } else {
        await createUser(data as CreateUserFormValues);
        toast.success('User created successfully');
      }
      navigate('/users');
    } catch (err) {
      toast.error(errorMessage(err));
    }
  });

  if (isEditing && isUserLoading) {
    return <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-fg-muted)' }}>Loading...</div>;
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)' }}>{isEditing ? 'Edit User' : 'Add New User'}</h1>
        <Button variant="ghost" onClick={() => navigate('/users')}>Cancel</Button>
      </div>

      <div style={{ backgroundColor: 'var(--color-bg-elevated)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
        <form onSubmit={onSubmit} noValidate>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <FormField label="First Name" htmlFor="firstName" error={errors.firstName?.message} required>
              <Input id="firstName" placeholder="John" invalid={!!errors.firstName} {...register('firstName')} />
            </FormField>

            <FormField label="Last Name" htmlFor="lastName" error={errors.lastName?.message} required>
              <Input id="lastName" placeholder="Doe" invalid={!!errors.lastName} {...register('lastName')} />
            </FormField>
          </div>

          <FormField label="Email" htmlFor="email" error={errors.email?.message} required>
            <Input id="email" type="email" placeholder="john.doe@example.com" invalid={!!errors.email} {...register('email')} />
          </FormField>

          {!isEditing && (
            <FormField label="Password" htmlFor="password" error={errors.password?.message} required>
              <PasswordInput id="password" placeholder="••••••••" invalid={!!errors.password} {...register('password')} />
            </FormField>
          )}

          <FormField label="Phone (Optional)" htmlFor="phone" error={errors.phone?.message}>
            <Input id="phone" placeholder="+1234567890" invalid={!!errors.phone} {...register('phone')} />
          </FormField>

          <div style={{ marginBottom: 'var(--space-4)' }}>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--space-2)' }}>
              Roles <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              {ROLES.map(role => {
                const isSelected = selectedRoles.includes(role);
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => toggleRole(role)}
                    style={{
                      padding: 'var(--space-2) var(--space-4)',
                      borderRadius: 'var(--radius-full)',
                      border: `1px solid ${isSelected ? 'var(--color-accent)' : 'var(--color-bg-muted)'}`,
                      backgroundColor: isSelected ? 'color-mix(in srgb, var(--color-accent) 10%, transparent)' : 'transparent',
                      color: isSelected ? 'var(--color-accent)' : 'var(--color-fg-muted)',
                      fontSize: 'var(--font-size-xs)',
                      fontWeight: 'var(--font-weight-medium)',
                      cursor: 'pointer',
                      transition: 'all var(--duration-fast)',
                    }}
                  >
                    {role}
                  </button>
                );
              })}
            </div>
            {errors.roles?.message && (
              <span role="alert" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-danger)', marginTop: 'var(--space-1)', display: 'block' }}>
                {errors.roles.message}
              </span>
            )}
          </div>

          <div style={{ marginBottom: 'var(--space-6)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
              <input type="checkbox" {...register('isActive')} />
              <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>Active Account</span>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
            <Button type="button" variant="ghost" onClick={() => navigate('/users')}>Cancel</Button>
            <Button type="submit" isLoading={isCreating || isUpdating} loadingText="Saving...">
              {isEditing ? 'Save Changes' : 'Create User'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
