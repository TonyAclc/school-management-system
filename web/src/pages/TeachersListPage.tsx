import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useTeachersList } from '../features/teachers/hooks/useTeachers';
import { DataTable, ColumnDef } from '../components/DataTable';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
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
      key: 'employeeNumber',
      header: 'Employee ID',
      cell: (teacher) => <div style={{ fontWeight: 'var(--font-weight-medium)' }}>{teacher.employeeNumber}</div>,
    },
    {
      key: 'name',
      header: 'Name',
      cell: (teacher) => <div>{teacher.user.firstName} {teacher.user.lastName}</div>,
    },
    {
      key: 'department',
      header: 'Department',
      cell: (teacher) => <div style={{ color: 'var(--color-fg-muted)' }}>{teacher.department || 'N/A'}</div>,
    },
    {
      key: 'email',
      header: 'Email',
      cell: (teacher) => <div style={{ color: 'var(--color-fg-muted)' }}>{teacher.user.email}</div>,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (teacher) => (
        <div style={{ color: teacher.user.isActive ? 'var(--color-success)' : 'var(--color-danger)' }}>
          {teacher.user.isActive ? 'Active' : 'Inactive'}
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      cell: (teacher) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
          <Button variant="ghost" size="sm" onClick={() => navigate(`/teachers/${teacher.id}/edit`)}>Edit</Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)' }}>Teachers</h1>
        <Button onClick={() => navigate('/teachers/new')}>Add Teacher</Button>
      </div>

      <div style={{ marginBottom: 'var(--space-4)', maxWidth: '300px' }}>
        <Input 
          placeholder="Search teachers..." 
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setTimeout(() => setDebouncedSearch(e.target.value), 300);
          }}
        />
      </div>

      {isError ? (
        <div style={{ color: 'var(--color-danger)' }}>Failed to load teachers.</div>
      ) : (
        <>
          <DataTable 
            data={data?.items ?? []} 
            columns={columns} 
            isLoading={isLoading} 
            emptyMessage="No teachers found matching your search."
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
