import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: string;
  actions?: ReactNode;
  count?: number;
}

export const PageHeader = ({ title, subtitle, icon, actions, count }: PageHeaderProps) => (
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 'var(--space-6)',
    animation: 'fadeIn var(--duration-base) var(--easing-decelerate)',
  }}>
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        {icon && <span style={{ fontSize: '1.75rem' }}>{icon}</span>}
        <div>
          <h1 style={{
            fontSize: 'var(--font-size-2xl)',
            fontWeight: 'var(--font-weight-bold)' as any,
            color: 'var(--color-fg)',
            margin: 0,
            lineHeight: 'var(--line-height-tight)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
          }}>
            {title}
            {count !== undefined && (
              <span style={{
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-medium)' as any,
                color: 'var(--color-accent)',
                backgroundColor: 'var(--color-accent-light)',
                padding: '2px 10px',
                borderRadius: 'var(--radius-full)',
              }}>
                {count}
              </span>
            )}
          </h1>
          {subtitle && (
            <p style={{
              color: 'var(--color-fg-muted)',
              fontSize: 'var(--font-size-sm)',
              marginTop: 'var(--space-1)',
            }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
    {actions && (
      <div style={{ display: 'flex', gap: 'var(--space-3)', flexShrink: 0 }}>
        {actions}
      </div>
    )}
  </div>
);
