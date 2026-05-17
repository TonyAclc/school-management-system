import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useSearchParams } from 'react-router';
import { registerFormSchema, RegisterFormValues } from '../features/auth/schemas';
import { authService } from '../features/auth/services/auth.service';
import { FormField } from '../components/FormField';
import { Input } from '../components/Input';
import { PasswordInput } from '../components/PasswordInput';
import { Button } from '../components/Button';
import { toast } from '../store/toast-store';
import { errorMessage } from '../lib/api-error';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    mode: 'onSubmit',
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      // Omit confirmPassword
      const { confirmPassword, ...payload } = data;
      await authService.register(payload);
      toast.success('Account created successfully!');
      navigate(redirect, { replace: true });
    } catch (err) {
      toast.error(errorMessage(err));
    }
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg)', padding: 'var(--space-4)' }}>
      <div style={{ width: '100%', maxWidth: '500px', padding: 'var(--space-6)', backgroundColor: 'var(--color-bg-elevated)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)' }}>
        <h1 style={{ marginBottom: 'var(--space-2)', fontSize: 'var(--font-size-2xl)', textAlign: 'center' }}>Create Account</h1>
        <p style={{ marginBottom: 'var(--space-6)', color: 'var(--color-fg-muted)', textAlign: 'center' }}>
          Join the School Management System.
        </p>

        <form onSubmit={onSubmit} noValidate>
          <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
            <div style={{ flex: 1 }}>
              <FormField label="First Name" htmlFor="firstName" error={errors.firstName?.message} required>
                <Input id="firstName" invalid={!!errors.firstName} {...register('firstName')} />
              </FormField>
            </div>
            <div style={{ flex: 1 }}>
              <FormField label="Last Name" htmlFor="lastName" error={errors.lastName?.message} required>
                <Input id="lastName" invalid={!!errors.lastName} {...register('lastName')} />
              </FormField>
            </div>
          </div>

          <FormField label="Email" htmlFor="email" error={errors.email?.message} required>
            <Input id="email" type="email" placeholder="you@example.com" invalid={!!errors.email} {...register('email')} />
          </FormField>

          <FormField label="Phone" htmlFor="phone" error={errors.phone?.message}>
            <Input id="phone" type="tel" invalid={!!errors.phone} {...register('phone')} />
          </FormField>

          <FormField label="Password" htmlFor="password" error={errors.password?.message} required>
            <PasswordInput id="password" invalid={!!errors.password} {...register('password')} />
          </FormField>

          <FormField label="Confirm Password" htmlFor="confirmPassword" error={errors.confirmPassword?.message} required>
            <PasswordInput id="confirmPassword" invalid={!!errors.confirmPassword} {...register('confirmPassword')} />
          </FormField>

          <div style={{ marginTop: 'var(--space-6)' }}>
            <Button type="submit" fullWidth isLoading={isSubmitting} loadingText="Creating account...">
              Register
            </Button>
          </div>
        </form>

        <div style={{ marginTop: 'var(--space-6)', textAlign: 'center', fontSize: 'var(--font-size-sm)' }}>
          Already have an account? <a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Sign in here</a>
        </div>
      </div>
    </div>
  );
};
