import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useSearchParams } from 'react-router';
import { loginFormSchema, LoginFormValues } from '../features/auth/schemas';
import { authService } from '../features/auth/services/auth.service';
import { FormField } from '../components/FormField';
import { Input } from '../components/Input';
import { PasswordInput } from '../components/PasswordInput';
import { Button } from '../components/Button';
import { toast } from '../store/toast-store';
import { errorMessage } from '../lib/api-error';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    mode: 'onSubmit',
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      await authService.login(data);
      toast.success('Welcome back!');
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
        maxWidth: 420,
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
            E
          </div>
          <h1 style={{
            fontSize: 'var(--font-size-2xl)',
            fontWeight: 'var(--font-weight-bold)' as any,
            color: 'var(--color-fg)',
            margin: '0 0 var(--space-1) 0',
          }}>
            Welcome Back
          </h1>
          <p style={{
            color: 'var(--color-fg-muted)',
            fontSize: 'var(--font-size-sm)',
          }}>
            Sign in to EduManage to continue
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
            <FormField label="Email" htmlFor="email" error={errors.email?.message} required>
              <Input id="email" type="email" invalid={!!errors.email}
                style={{ borderRadius: 'var(--radius-lg)' }}
                {...register('email')} />
            </FormField>

            <FormField label="Password" htmlFor="password" error={errors.password?.message} required>
              <PasswordInput id="password" invalid={!!errors.password}
                {...register('password')} />
            </FormField>

            <div style={{ marginTop: 'var(--space-6)' }}>
              <Button type="submit" fullWidth isLoading={isSubmitting} loadingText="Signing in..."
                style={{
                  background: 'var(--color-accent-gradient)',
                  border: 'none',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-3) var(--space-6)',
                  boxShadow: '0 4px 12px rgb(99 102 241 / 0.3)',
                  fontSize: 'var(--font-size-base)',
                  fontWeight: 'var(--font-weight-semibold)' as any,
                }}>
                Sign In
              </Button>
            </div>
          </form>

          <div style={{
            marginTop: 'var(--space-6)',
            textAlign: 'center',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-fg-muted)',
          }}>
            Don't have an account?{' '}
            <a href="/register" onClick={(e) => { e.preventDefault(); navigate('/register'); }}
              style={{ fontWeight: 'var(--font-weight-semibold)' as any }}>
              Create account
            </a>
          </div>

          {/* Admin Credentials */}
          <div style={{
            marginTop: 'var(--space-5)',
            padding: 'var(--space-4)',
            backgroundColor: 'var(--color-bg-subtle)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
          }}>
            <p style={{
              fontSize: 'var(--font-size-xs)',
              fontWeight: 'var(--font-weight-semibold)' as any,
              color: 'var(--color-fg-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 'var(--space-2)',
              textAlign: 'center',
            }}>
              Admin Credentials
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              gap: '4px 12px',
              fontSize: 'var(--font-size-sm)',
            }}>
              <span style={{ color: 'var(--color-fg-muted)', fontWeight: 'var(--font-weight-medium)' as any }}>Username:</span>
              <span style={{ color: 'var(--color-fg)', fontFamily: 'var(--font-mono)', fontWeight: 'var(--font-weight-semibold)' as any }}>admin@school.com</span>
              <span style={{ color: 'var(--color-fg-muted)', fontWeight: 'var(--font-weight-medium)' as any }}>Password:</span>
              <span style={{ color: 'var(--color-fg)', fontFamily: 'var(--font-mono)', fontWeight: 'var(--font-weight-semibold)' as any }}>admin123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
