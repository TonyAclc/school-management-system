import { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ invalid, className, style, ...props }, ref) => {
    const baseStyle: React.CSSProperties = {
      display: 'block',
      width: '100%',
      padding: 'var(--space-2) var(--space-3)',
      fontSize: 'var(--font-size-base)',
      fontFamily: 'var(--font-sans)',
      color: 'var(--color-fg)',
      backgroundColor: 'var(--color-bg-elevated)',
      border: '1px solid',
      borderColor: invalid ? 'var(--color-danger)' : 'var(--color-bg-muted)',
      borderRadius: 'var(--radius-md)',
      transition: 'border-color var(--duration-fast), box-shadow var(--duration-fast)',
      outline: 'none',
      ...style,
    };

    return (
      <input
        ref={ref}
        aria-invalid={invalid ? 'true' : undefined}
        style={baseStyle}
        onFocus={(e) => {
          e.target.style.boxShadow = invalid ? 'var(--shadow-focus-danger)' : 'var(--shadow-focus)';
          e.target.style.borderColor = invalid ? 'var(--color-danger)' : 'var(--color-accent)';
        }}
        onBlur={(e) => {
          e.target.style.boxShadow = 'none';
          e.target.style.borderColor = invalid ? 'var(--color-danger)' : 'var(--color-bg-muted)';
        }}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
