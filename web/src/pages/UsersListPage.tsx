import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useUsersList } from '../features/users/hooks/useUsers';
import { DataTable, ColumnDef } from '../components/DataTable';
import { Badge } from '../components/Badge';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { PublicUser } from '../features/auth/schemas';

export const UsersListPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  
  // Real debouncing would be used here in production
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const { data, isLoading, isError } = useUsersList({
    page,
    pageSize: 20,
    search: debouncedSearch || undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const navigate = useNavigate();

  const columns: ColumnDef<PublicUser>[] = [
    {
      key: 'name',
      header: 'Name',
      cell: (user) => <div style={{ fontWeight: 'var(--font-weight-medium)' }}>{user.firstName} {user.lastName}</div>,
    },
    {
      key: 'email',
      header: 'Email',
      cell: (user) => <div style={{ color: 'var(--color-fg-muted)' }}>{user.email}</div>,
    },
    {
      key: 'roles',
      header: 'Roles',
      cell: (user) => (
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          {user.roles.map(role => (
            <Badge key={role} variant={role === 'ADMIN' ? 'danger' : role === 'TEACHER' ? 'info' : 'neutral'}>
              {role}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      cell: (user) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
          <Button variant="ghost" size="sm" onClick={() => navigate(`/users/${user.id}/edit`)}>Edit</Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)' }}>Users</h1>
        <Button onClick={() => navigate('/users/new')}>Add User</Button>
      </div>

      <div style={{ marginBottom: 'var(--space-4)', maxWidth: '300px' }}>
        <Input 
          placeholder="Search users..." 
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            // Simulate debounce for demonstration
            setTimeout(() => setDebouncedSearch(e.target.value), 300);
          }}
        />
      </div>

      {isError ? (
        <div style={{ color: 'var(--color-danger)' }}>Failed to load users.</div>
      ) : (
        <>
          <DataTable 
            data={data?.items ?? []} 
            columns={columns} 
            isLoading={isLoading} 
            emptyMessage="No users found matching your search."
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
