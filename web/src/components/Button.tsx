import { ButtonHTMLAttributes, forwardRef } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
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
    // A primitive inline styling for now.
    // In a full implementation we would use CSS modules or vanilla extract classes.
    const baseStyle: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 'var(--radius-md)',
      fontWeight: 'var(--font-weight-medium)',
      cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
      opacity: disabled || isLoading ? 0.6 : 1,
      width: fullWidth ? '100%' : 'auto',
      transition: 'background-color var(--duration-fast), color var(--duration-fast), border-color var(--duration-fast)',
      border: '1px solid transparent',
      ...style,
    };

    const variantStyles: Record<string, React.CSSProperties> = {
      primary: {
        backgroundColor: 'var(--color-accent)',
        color: 'var(--color-accent-fg)',
      },
      secondary: {
        backgroundColor: 'transparent',
        color: 'var(--color-fg)',
        border: '1px solid var(--color-bg-muted)',
      },
      danger: {
        backgroundColor: 'var(--color-danger)',
        color: 'white',
      },
      ghost: {
        backgroundColor: 'transparent',
        color: 'var(--color-fg)',
      },
    };

    const sizeStyles: Record<string, React.CSSProperties> = {
      sm: { padding: 'var(--space-1) var(--space-2)', fontSize: 'var(--font-size-sm)' },
      md: { padding: 'var(--space-2) var(--space-4)', fontSize: 'var(--font-size-base)' },
      lg: { padding: 'var(--space-3) var(--space-6)', fontSize: 'var(--font-size-lg)' },
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        style={{ ...baseStyle, ...variantStyles[variant], ...sizeStyles[size] }}
        {...props}
      >
        {isLoading ? (loadingText || 'Loading...') : children}
      </button>
    );
  }
);

Button.displayName = 'Button';
