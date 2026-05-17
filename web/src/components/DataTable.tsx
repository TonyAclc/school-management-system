import { ReactNode } from 'react';

export interface ColumnDef<T> {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
}

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export const DataTable = <T extends { id: string | number }>({
  data,
  columns,
  isLoading,
  emptyMessage = 'No results found.',
}: DataTableProps<T>) => {
  if (isLoading) {
    return <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-fg-muted)' }}>Loading...</div>;
  }

  if (!data || data.length === 0) {
    return (
      <div style={{ padding: 'var(--space-10)', textAlign: 'center', backgroundColor: 'var(--color-bg-elevated)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-bg-muted)' }}>
        <p style={{ color: 'var(--color-fg-muted)' }}>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto', backgroundColor: 'var(--color-bg-elevated)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-bg-muted)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--font-size-sm)' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--color-bg-muted)', backgroundColor: 'var(--color-bg-muted)' }}>
            {columns.map(col => (
              <th key={col.key} style={{ padding: 'var(--space-3) var(--space-4)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-fg-muted)' }}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id} style={{ borderBottom: '1px solid var(--color-bg-muted)', transition: 'background-color var(--duration-fast)' }}>
              {columns.map(col => (
                <td key={col.key} style={{ padding: 'var(--space-3) var(--space-4)', verticalAlign: 'middle' }}>
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
