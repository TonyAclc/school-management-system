import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useTeachersList } from '../features/teachers/hooks/useTeachers';
import { DataTable, ColumnDef } from '../components/DataTable';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { PageHeader } from '../components/PageHeader';
import { SearchBar } from '../components/SearchBar';
import { Teacher } from '../features/teachers/schemas';

export const TeachersListPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const { data, isLoading, isError } = useTeachersList({
    page,
    pageSize: 20,
    search: debouncedSearch || undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const navigate = useNavigate();

  const columns: ColumnDef<Teacher>[] = [
    {
      key: 'teacher',
      header: 'Teacher',
      cell: (teacher) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-full)',
            background: 'linear-gradient(135deg, #10b981, #34d399)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'var(--font-size-xs)',
            fontWeight: 'var(--font-weight-bold)' as any,
            color: 'white',
            flexShrink: 0,
          }}>
            {(teacher.user.firstName?.[0] || '')}{(teacher.user.lastName?.[0] || '')}
          </div>
          <div>
            <div style={{ fontWeight: 'var(--font-weight-semibold)' as any, color: 'var(--color-fg)' }}>
              {teacher.user.firstName} {teacher.user.lastName}
            </div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-fg-muted)' }}>
              {teacher.user.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'employeeNumber',
      header: 'Employee ID',
      cell: (teacher) => (
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--font-size-xs)',
          color: 'var(--color-fg)',
          backgroundColor: 'var(--color-bg-subtle)',
          padding: '2px 8px',
          borderRadius: 'var(--radius-sm)',
        }}>
          {teacher.employeeNumber}
        </span>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      cell: (teacher) => (
        <span style={{ color: teacher.department ? 'var(--color-fg)' : 'var(--color-fg-subtle)' }}>
          {teacher.department || '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (teacher) => (
        <Badge variant={teacher.user.isActive ? 'success' : 'danger'}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: teacher.user.isActive ? 'var(--color-success)' : 'var(--color-danger)',
            }} />
            {teacher.user.isActive ? 'Active' : 'Inactive'}
          </span>
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '80px',
      cell: (teacher) => (
        <Button variant="ghost" size="sm" onClick={() => navigate(`/teachers/${teacher.id}/edit`)}
          style={{ color: 'var(--color-accent)' }}>
          Edit →
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Teachers"
        subtitle="Manage faculty members, departments, and assignments"
        icon="🎓"
        count={data?.totalCount}
        actions={
          <Button onClick={() => navigate('/teachers/new')}
            style={{ background: 'var(--color-accent-gradient)', border: 'none', boxShadow: '0 4px 12px rgb(99 102 241 / 0.3)' }}>
            + Add Teacher
          </Button>
        }
      />

      <div style={{ marginBottom: 'var(--space-5)' }}>
        <SearchBar
          placeholder="Search by name or employee ID..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setTimeout(() => setDebouncedSearch(e.target.value), 300);
          }}
        />
      </div>

      {isError ? (
        <div style={{
          padding: 'var(--space-10)',
          textAlign: 'center',
          background: 'var(--color-danger-light)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid rgb(239 68 68 / 0.2)',
        }}>
          <span style={{ fontSize: '2rem', display: 'block', marginBottom: 'var(--space-2)' }}>⚠️</span>
          <span style={{ color: 'var(--color-danger)' }}>Failed to load teachers. Please try again.</span>
        </div>
      ) : (
        <>
          <DataTable
            data={data?.items ?? []}
            columns={columns}
            isLoading={isLoading}
            emptyMessage="No teachers found. Start by adding your first faculty member."
            emptyIcon="🎓"
          />

          {data && data.totalPages > 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 'var(--space-3)',
              marginTop: 'var(--space-5)',
            }}>
              <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}
                style={{ borderRadius: 'var(--radius-lg)' }}>
                ← Previous
              </Button>
              <span style={{
                padding: 'var(--space-2) var(--space-4)',
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-fg-muted)',
                fontWeight: 'var(--font-weight-medium)' as any,
                backgroundColor: 'var(--color-bg-elevated)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
              }}>
                {data.page} / {data.totalPages}
              </span>
              <Button variant="secondary" size="sm" disabled={page === data.totalPages} onClick={() => setPage(p => p + 1)}
                style={{ borderRadius: 'var(--radius-lg)' }}>
                Next →
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
