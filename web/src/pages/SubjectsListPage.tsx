import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useSubjectsList } from '../features/subjects/hooks/useSubjects';
import { DataTable, ColumnDef } from '../components/DataTable';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Subject } from '../features/subjects/schemas';

export const SubjectsListPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const { data, isLoading, isError } = useSubjectsList({
    page,
    pageSize: 20,
    search: debouncedSearch || undefined,
    sortBy: 'code',
    sortOrder: 'asc',
  });

  const navigate = useNavigate();

  const columns: ColumnDef<Subject>[] = [
    {
      key: 'code',
      header: 'Code',
      cell: (subject) => <div style={{ fontWeight: 'var(--font-weight-medium)' }}>{subject.code}</div>,
    },
    {
      key: 'name',
      header: 'Subject Name',
      cell: (subject) => <div>{subject.name}</div>,
    },
    {
      key: 'teacher',
      header: 'Assigned Teacher',
      cell: (subject) => (
        <div style={{ color: 'var(--color-fg-muted)' }}>
          {subject.teacher ? `${subject.teacher.user.firstName} ${subject.teacher.user.lastName}` : 'Unassigned'}
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      cell: (subject) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
          <Button variant="ghost" size="sm" onClick={() => navigate(`/subjects/${subject.id}/edit`)}>Edit</Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)' }}>Subjects</h1>
        <Button onClick={() => navigate('/subjects/new')}>Add Subject</Button>
      </div>

      <div style={{ marginBottom: 'var(--space-4)', maxWidth: '300px' }}>
        <Input 
          placeholder="Search subjects..." 
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setTimeout(() => setDebouncedSearch(e.target.value), 300);
          }}
        />
      </div>

      {isError ? (
        <div style={{ color: 'var(--color-danger)' }}>Failed to load subjects.</div>
      ) : (
        <>
          <DataTable 
            data={data?.items ?? []} 
            columns={columns} 
            isLoading={isLoading} 
            emptyMessage="No subjects found matching your search."
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
