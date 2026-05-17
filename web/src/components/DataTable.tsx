import { ReactNode } from 'react';

export interface ColumnDef<T> {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  width?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
  emptyIcon?: string;
}

export const DataTable = <T extends { id: string | number }>({
  data,
  columns,
  isLoading,
  emptyMessage = 'No results found.',
  emptyIcon = '📭',
}: DataTableProps<T>) => {
  if (isLoading) {
    return (
      <div style={{
        background: 'var(--color-bg-elevated)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-card)',
      }}>
        {/* Skeleton header */}
        <div style={{
          padding: 'var(--space-4) var(--space-5)',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          gap: 'var(--space-8)',
        }}>
          {columns.map(col => (
            <div key={col.key} className="skeleton" style={{ height: 14, width: 80, borderRadius: 'var(--radius-sm)' }} />
          ))}
        </div>
        {/* Skeleton rows */}
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{
            padding: 'var(--space-4) var(--space-5)',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            gap: 'var(--space-8)',
            alignItems: 'center',
          }}>
            {columns.map(col => (
              <div key={col.key} className="skeleton" style={{
                height: 14,
                width: col.key === 'actions' ? 60 : `${60 + Math.random() * 80}px`,
                borderRadius: 'var(--radius-sm)',
              }} />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div style={{
        padding: 'var(--space-16) var(--space-8)',
        textAlign: 'center',
        backgroundColor: 'var(--color-bg-elevated)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-card)',
        animation: 'fadeIn var(--duration-base) var(--easing-decelerate)',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)', opacity: 0.6 }}>{emptyIcon}</div>
        <p style={{
          color: 'var(--color-fg-muted)',
          fontSize: 'var(--font-size-base)',
          maxWidth: 320,
          margin: '0 auto',
          lineHeight: 'var(--line-height-relaxed)',
        }}>
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div style={{
      overflowX: 'auto',
      backgroundColor: 'var(--color-bg-elevated)',
      borderRadius: 'var(--radius-xl)',
      boxShadow: 'var(--shadow-card)',
      border: '1px solid var(--color-border)',
      animation: 'fadeIn var(--duration-base) var(--easing-decelerate)',
    }}>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        textAlign: 'left',
        fontSize: 'var(--font-size-sm)',
      }}>
        <thead>
          <tr style={{
            borderBottom: '2px solid var(--color-border)',
          }}>
            {columns.map(col => (
              <th key={col.key} style={{
                padding: 'var(--space-3) var(--space-5)',
                fontWeight: 'var(--font-weight-semibold)' as any,
                color: 'var(--color-fg-muted)',
                fontSize: 'var(--font-size-xs)',
                textTransform: 'uppercase' as const,
                letterSpacing: '0.05em',
                backgroundColor: 'var(--color-bg-subtle)',
                whiteSpace: 'nowrap' as const,
                width: col.width,
              }}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIdx) => (
            <tr
              key={row.id}
              style={{
                borderBottom: rowIdx < data.length - 1 ? '1px solid var(--color-border)' : 'none',
                transition: 'background-color var(--duration-fast) var(--easing-standard)',
                animation: `fadeIn var(--duration-fast) var(--easing-decelerate) both`,
                animationDelay: `${rowIdx * 30}ms`,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-bg-subtle)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
              }}
            >
              {columns.map(col => (
                <td key={col.key} style={{
                  padding: 'var(--space-3) var(--space-5)',
                  verticalAlign: 'middle',
                }}>
                  {col.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
