import { ButtonHTMLAttributes, forwardRef } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading,
      loadingText,
      fullWidth,
      disabled,
      style,
      ...props
    },
    ref
  ) => {
    const baseStyle: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 'var(--space-2)',
      borderRadius: 'var(--radius-md)',
      fontWeight: 'var(--font-weight-medium)',
      fontFamily: 'var(--font-sans)',
      cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
      opacity: disabled || isLoading ? 0.6 : 1,
      width: fullWidth ? '100%' : 'auto',
      transition: 'all var(--duration-fast) var(--easing-standard)',
      border: '1px solid transparent',
      whiteSpace: 'nowrap',
      letterSpacing: '0.01em',
      ...style,
    };

    const variantStyles: Record<string, React.CSSProperties> = {
      primary: {
        backgroundColor: 'var(--color-accent)',
        color: 'var(--color-accent-fg)',
        boxShadow: 'var(--shadow-sm)',
      },
      secondary: {
        backgroundColor: 'var(--color-bg-elevated)',
        color: 'var(--color-fg)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-xs)',
      },
      outline: {
        backgroundColor: 'transparent',
        color: 'var(--color-accent)',
        border: '1px solid var(--color-accent)',
      },
      danger: {
        backgroundColor: 'var(--color-danger)',
        color: 'white',
        boxShadow: 'var(--shadow-sm)',
      },
      ghost: {
        backgroundColor: 'transparent',
        color: 'var(--color-fg-muted)',
      },
    };

    const sizeStyles: Record<string, React.CSSProperties> = {
      sm: { padding: '0.25rem 0.625rem', fontSize: 'var(--font-size-sm)' },
      md: { padding: '0.5rem 1rem', fontSize: 'var(--font-size-sm)' },
      lg: { padding: '0.625rem 1.5rem', fontSize: 'var(--font-size-base)' },
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        style={{ ...baseStyle, ...variantStyles[variant], ...sizeStyles[size] }}
        {...props}
      >
        {isLoading ? (loadingText || '⏳ Loading...') : children}
      </button>
    );
  }
);

Button.displayName = 'Button';
