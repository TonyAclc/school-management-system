import { ReactNode } from 'react';

export interface BadgeProps {
  children: ReactNode;
  variant?: 'neutral' | 'success' | 'warning' | 'danger' | 'info';
}

export const Badge = ({ children, variant = 'neutral' }: BadgeProps) => {
  const variants: Record<string, { bg: string; text: string }> = {
    neutral: { bg: 'var(--color-bg-muted)', text: 'var(--color-fg-muted)' },
    success: { bg: 'color-mix(in srgb, var(--color-success) 15%, transparent)', text: 'var(--color-success)' },
    warning: { bg: 'color-mix(in srgb, var(--color-warning) 15%, transparent)', text: 'var(--color-warning)' },
    danger: { bg: 'color-mix(in srgb, var(--color-danger) 15%, transparent)', text: 'var(--color-danger)' },
    info: { bg: 'color-mix(in srgb, var(--color-info) 15%, transparent)', text: 'var(--color-info)' },
  };

  const style = variants[variant] || variants.neutral;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.125rem 0.5rem',
        borderRadius: 'var(--radius-full)',
        fontSize: 'var(--font-size-xs)',
        fontWeight: 'var(--font-weight-medium)',
        backgroundColor: style.bg,
        color: style.text,
      }}
    >
      {children}
    </span>
  );
};
