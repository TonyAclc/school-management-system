import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useClassesList } from '../features/classes/hooks/useClasses';
import { DataTable, ColumnDef } from '../components/DataTable';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { PageHeader } from '../components/PageHeader';
import { SearchBar } from '../components/SearchBar';
import { ClassModel } from '../features/classes/schemas';

export const ClassesListPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const { data, isLoading, isError } = useClassesList({
    page,
    pageSize: 20,
    search: debouncedSearch || undefined,
    sortBy: 'gradeLevel',
    sortOrder: 'asc',
  });

  const navigate = useNavigate();

  const columns: ColumnDef<ClassModel>[] = [
    {
      key: 'class',
      header: 'Course / Section',
      cell: (cls) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1rem',
            flexShrink: 0,
          }}>
            🏫
          </div>
          <div>
            <div style={{ fontWeight: 'var(--font-weight-semibold)' as any, color: 'var(--color-fg)' }}>
              {cls.gradeLevel}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'academicYear',
      header: 'Academic Year',
      cell: (cls) => (
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--font-size-xs)',
          color: 'var(--color-fg)',
          backgroundColor: 'var(--color-bg-subtle)',
          padding: '2px 8px',
          borderRadius: 'var(--radius-sm)',
        }}>
          {cls.academicYear}
        </span>
      ),
    },
    {
      key: 'homeroomTeacher',
      header: 'Course Adviser',
      cell: (cls) => (
        cls.homeroomTeacher ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <div style={{
              width: 24,
              height: 24,
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, #10b981, #34d399)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.6rem',
              fontWeight: 'var(--font-weight-bold)' as any,
              color: 'white',
              flexShrink: 0,
            }}>
              {cls.homeroomTeacher.user.firstName?.[0]}{cls.homeroomTeacher.user.lastName?.[0]}
            </div>
            <span style={{ fontSize: 'var(--font-size-sm)' }}>
              {cls.homeroomTeacher.user.firstName} {cls.homeroomTeacher.user.lastName}
            </span>
          </div>
        ) : (
          <span style={{ color: 'var(--color-fg-subtle)', fontSize: 'var(--font-size-sm)' }}>
            Unassigned
          </span>
        )
      ),
    },
    {
      key: 'studentsCount',
      header: 'Students',
      cell: (cls) => (
        <Badge variant={(cls._count?.enrollments || 0) > 0 ? 'info' : 'neutral'}>
          {cls._count?.enrollments || 0} enrolled
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '160px',
      cell: (cls) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
          <Button variant="secondary" size="sm" onClick={() => navigate(`/classes/${cls.id}`)}
            style={{ borderRadius: 'var(--radius-lg)', fontSize: 'var(--font-size-xs)' }}>
            View
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate(`/classes/${cls.id}/edit`)}
            style={{ color: 'var(--color-accent)' }}>
            Edit →
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Classes"
        subtitle="Organize course sections, assign advisers, and manage enrollment"
        icon="🏫"
        count={data?.total}
        actions={
          <Button onClick={() => navigate('/classes/new')}
            style={{ background: 'var(--color-accent-gradient)', border: 'none', boxShadow: '0 4px 12px rgb(99 102 241 / 0.3)' }}>
            + Add Class
          </Button>
        }
      />

      <div style={{ marginBottom: 'var(--space-5)' }}>
        <SearchBar
          placeholder="Search by course or section..."
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
          <span style={{ color: 'var(--color-danger)' }}>Failed to load classes. Please try again.</span>
        </div>
      ) : (
        <>
          <DataTable
            data={data?.items ?? []}
            columns={columns}
            isLoading={isLoading}
            emptyMessage="No course sections created yet. Create your first section to get started."
            emptyIcon="🏫"
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
