import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useStudentsList } from '../features/students/hooks/useStudents';
import { DataTable, ColumnDef } from '../components/DataTable';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Student } from '../features/students/schemas';

export const StudentsListPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const { data, isLoading, isError } = useStudentsList({
    page,
    pageSize: 20,
    search: debouncedSearch || undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const navigate = useNavigate();

  const columns: ColumnDef<Student>[] = [
    {
      key: 'studentNumber',
      header: 'Student ID',
      cell: (student) => <div style={{ fontWeight: 'var(--font-weight-medium)' }}>{student.studentNumber}</div>,
    },
    {
      key: 'name',
      header: 'Name',
      cell: (student) => <div>{student.user.firstName} {student.user.lastName}</div>,
    },
    {
      key: 'email',
      header: 'Email',
      cell: (student) => <div style={{ color: 'var(--color-fg-muted)' }}>{student.user.email}</div>,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (student) => (
        <div style={{ color: student.user.isActive ? 'var(--color-success)' : 'var(--color-danger)' }}>
          {student.user.isActive ? 'Active' : 'Inactive'}
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      cell: (student) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
          <Button variant="ghost" size="sm" onClick={() => navigate(`/students/${student.id}/edit`)}>Edit</Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)' }}>Students</h1>
        <Button onClick={() => navigate('/students/new')}>Add Student</Button>
      </div>

      <div style={{ marginBottom: 'var(--space-4)', maxWidth: '300px' }}>
        <Input 
          placeholder="Search students..." 
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setTimeout(() => setDebouncedSearch(e.target.value), 300);
          }}
        />
      </div>

      {isError ? (
        <div style={{ color: 'var(--color-danger)' }}>Failed to load students.</div>
      ) : (
        <>
          <DataTable 
            data={data?.items ?? []} 
            columns={columns} 
            isLoading={isLoading} 
            emptyMessage="No students found matching your search."
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
