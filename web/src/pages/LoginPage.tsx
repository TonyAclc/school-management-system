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
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg)' }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: 'var(--space-6)', backgroundColor: 'var(--color-bg-elevated)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)' }}>
        <h1 style={{ marginBottom: 'var(--space-2)', fontSize: 'var(--font-size-2xl)', textAlign: 'center' }}>Sign In</h1>
        <p style={{ marginBottom: 'var(--space-6)', color: 'var(--color-fg-muted)', textAlign: 'center' }}>
          Enter your email and password to access your account.
        </p>

        <form onSubmit={onSubmit} noValidate>
          <FormField label="Email" htmlFor="email" error={errors.email?.message} required>
            <Input id="email" type="email" placeholder="you@example.com" invalid={!!errors.email} {...register('email')} />
          </FormField>

          <FormField label="Password" htmlFor="password" error={errors.password?.message} required>
            <PasswordInput id="password" placeholder="••••••••" invalid={!!errors.password} {...register('password')} />
          </FormField>

          <div style={{ marginTop: 'var(--space-6)' }}>
            <Button type="submit" fullWidth isLoading={isSubmitting} loadingText="Signing in...">
              Sign In
            </Button>
          </div>
        </form>

        <div style={{ marginTop: 'var(--space-6)', textAlign: 'center', fontSize: 'var(--font-size-sm)' }}>
          Don't have an account? <a href="/register" onClick={(e) => { e.preventDefault(); navigate('/register'); }}>Register here</a>
        </div>
      </div>
    </div>
  );
};
