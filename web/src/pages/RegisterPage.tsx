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
      const { confirmPassword, ...payload } = data;
      await authService.register(payload);
      toast.success('Account created successfully!');
      navigate(redirect, { replace: true });
    } catch (err) {
      toast.error(errorMessage(err));
    }
  });

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 30%, #f0f2f7 70%, #ede9fe 100%)',
      padding: 'var(--space-4)',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 480,
        animation: 'fadeInUp var(--duration-slow) var(--easing-decelerate)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: 'var(--radius-xl)',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            fontWeight: 'var(--font-weight-bold)' as any,
            color: 'white',
            boxShadow: '0 8px 24px rgb(99 102 241 / 0.35)',
            marginBottom: 'var(--space-4)',
          }}>
            SMS
          </div>
          <h1 style={{
            fontSize: 'var(--font-size-2xl)',
            fontWeight: 'var(--font-weight-bold)' as any,
            color: 'var(--color-fg)',
            margin: '0 0 var(--space-1) 0',
          }}>
            Create Account
          </h1>
          <p style={{
            color: 'var(--color-fg-muted)',
            fontSize: 'var(--font-size-sm)',
          }}>
            Join SchoolManagement — School Management System
          </p>
        </div>

        {/* Card */}
        <div style={{
          padding: 'var(--space-8)',
          backgroundColor: 'var(--color-bg-elevated)',
          borderRadius: 'var(--radius-2xl)',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid rgb(255 255 255 / 0.8)',
        }}>
          <form onSubmit={onSubmit} noValidate>
            <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
              <div style={{ flex: 1 }}>
                <FormField label="First Name" htmlFor="firstName" error={errors.firstName?.message} required>
                  <Input id="firstName" invalid={!!errors.firstName}
                    style={{ borderRadius: 'var(--radius-lg)' }}
                    {...register('firstName')} />
                </FormField>
              </div>
              <div style={{ flex: 1 }}>
                <FormField label="Last Name" htmlFor="lastName" error={errors.lastName?.message} required>
                  <Input id="lastName" invalid={!!errors.lastName}
                    style={{ borderRadius: 'var(--radius-lg)' }}
                    {...register('lastName')} />
                </FormField>
              </div>
            </div>

            <FormField label="Email" htmlFor="email" error={errors.email?.message} required>
              <Input id="email" type="email" placeholder="you@example.com" invalid={!!errors.email}
                style={{ borderRadius: 'var(--radius-lg)' }}
                {...register('email')} />
            </FormField>

            <FormField label="Phone" htmlFor="phone" error={errors.phone?.message}>
              <Input id="phone" type="tel" placeholder="Optional" invalid={!!errors.phone}
                style={{ borderRadius: 'var(--radius-lg)' }}
                {...register('phone')} />
            </FormField>

            <FormField label="Password" htmlFor="password" error={errors.password?.message} required>
              <PasswordInput id="password" invalid={!!errors.password} {...register('password')} />
            </FormField>

            <FormField label="Confirm Password" htmlFor="confirmPassword" error={errors.confirmPassword?.message} required>
              <PasswordInput id="confirmPassword" invalid={!!errors.confirmPassword} {...register('confirmPassword')} />
            </FormField>

            <div style={{ marginTop: 'var(--space-6)' }}>
              <Button type="submit" fullWidth isLoading={isSubmitting} loadingText="Creating account..."
                style={{
                  background: 'var(--color-accent-gradient)',
                  border: 'none',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-3) var(--space-6)',
                  boxShadow: '0 4px 12px rgb(99 102 241 / 0.3)',
                  fontSize: 'var(--font-size-base)',
                  fontWeight: 'var(--font-weight-semibold)' as any,
                }}>
                Create Account
              </Button>
            </div>
          </form>

          <div style={{
            marginTop: 'var(--space-6)',
            textAlign: 'center',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-fg-muted)',
          }}>
            Already have an account?{' '}
            <a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login'); }}
              style={{ fontWeight: 'var(--font-weight-semibold)' as any }}>
              Sign in
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
