import { ReactNode } from 'react';

export interface FormFieldProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
}

export const FormField = ({ label, htmlFor, required, error, hint, children }: FormFieldProps) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', marginBottom: 'var(--space-4)' }}>
      <label 
        htmlFor={htmlFor} 
        style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-fg)' }}
      >
        {label} {required && <span style={{ color: 'var(--color-danger)' }} aria-hidden="true">*</span>}
      </label>
      
      {children}
      
      {hint && !error && (
        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-fg-muted)' }}>
          {hint}
        </span>
      )}
      
      {error && (
        <span role="alert" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-danger)' }}>
          {error}
        </span>
      )}
    </div>
  );
};
