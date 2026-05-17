import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useClassesList } from '../features/classes/hooks/useClasses';
import { DataTable, ColumnDef } from '../components/DataTable';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
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
      key: 'gradeLevel',
      header: 'Grade / Class Name',
      cell: (cls) => <div style={{ fontWeight: 'var(--font-weight-medium)' }}>{cls.gradeLevel}</div>,
    },
    {
      key: 'academicYear',
      header: 'Academic Year',
      cell: (cls) => <div>{cls.academicYear}</div>,
    },
    {
      key: 'homeroomTeacher',
      header: 'Homeroom Teacher',
      cell: (cls) => (
        <div style={{ color: 'var(--color-fg-muted)' }}>
          {cls.homeroomTeacher ? `${cls.homeroomTeacher.user.firstName} ${cls.homeroomTeacher.user.lastName}` : 'Unassigned'}
        </div>
      ),
    },
    {
      key: 'studentsCount',
      header: 'Enrolled Students',
      cell: (cls) => <div>{cls._count?.enrollments || 0}</div>,
    },
    {
      key: 'actions',
      header: '',
      cell: (cls) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
          <Button variant="outline" size="sm" onClick={() => navigate(`/classes/${cls.id}`)}>View & Enroll</Button>
          <Button variant="ghost" size="sm" onClick={() => navigate(`/classes/${cls.id}/edit`)}>Edit</Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)' }}>Classes</h1>
        <Button onClick={() => navigate('/classes/new')}>Add Class</Button>
      </div>

      <div style={{ marginBottom: 'var(--space-4)', maxWidth: '300px' }}>
        <Input 
          placeholder="Search classes..." 
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setTimeout(() => setDebouncedSearch(e.target.value), 300);
          }}
        />
      </div>

      {isError ? (
        <div style={{ color: 'var(--color-danger)' }}>Failed to load classes.</div>
      ) : (
        <>
          <DataTable 
            data={data?.items ?? []} 
            columns={columns} 
            isLoading={isLoading} 
            emptyMessage="No classes found matching your search."
          />
          
          {data && data.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
              <Button 
                variant="secondary" 
                disabled={page === 1} 
                onClick={() => setPage(p => p - 1)}
              >
                Previous
              </Button>
              <span style={{ display: 'flex', alignItems: 'center', padding: '0 var(--space-4)', color: 'var(--color-fg-muted)' }}>
                Page {data.page} of {data.totalPages}
              </span>
              <Button 
                variant="secondary" 
                disabled={page === data.totalPages} 
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
