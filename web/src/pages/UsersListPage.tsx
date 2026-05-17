import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useUsersList, useDeleteUser } from '../features/users/hooks/useUsers';
import { DataTable, ColumnDef } from '../components/DataTable';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { PageHeader } from '../components/PageHeader';
import { SearchBar } from '../components/SearchBar';
import { PublicUser } from '../features/auth/schemas';
import { toast } from '../store/toast-store';
import { errorMessage } from '../lib/api-error';
import { useAuthStore } from '../store/auth-store';

export const UsersListPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const { data, isLoading, isError } = useUsersList({
    page,
    pageSize: 20,
    search: debouncedSearch || undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const navigate = useNavigate();
  const currentUser = useAuthStore(s => s.user);
  const { mutateAsync: deleteUser } = useDeleteUser();

  const handleDelete = async (user: PublicUser) => {
    if (user.id === currentUser?.id) {
      toast.error('You cannot delete your own account');
      return;
    }
    const confirmed = window.confirm(`Are you sure you want to delete "${user.firstName} ${user.lastName}"? This action cannot be undone.`);
    if (!confirmed) return;
    try {
      await deleteUser(user.id);
      toast.success(`User "${user.firstName} ${user.lastName}" deleted successfully`);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const columns: ColumnDef<PublicUser>[] = [
    {
      key: 'name',
      header: 'Name',
      cell: (user) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-full)',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'var(--font-size-xs)',
            fontWeight: 'var(--font-weight-bold)' as any,
            color: 'white',
            flexShrink: 0,
          }}>
            {(user.firstName?.[0] || '')}{(user.lastName?.[0] || '')}
          </div>
          <div>
            <div style={{ fontWeight: 'var(--font-weight-semibold)' as any, color: 'var(--color-fg)' }}>
              {user.firstName} {user.lastName}
            </div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-fg-muted)' }}>
              {user.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (user) => (
        <Badge variant={user.isActive ? 'success' : 'danger'}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: user.isActive ? 'var(--color-success)' : 'var(--color-danger)',
            }} />
            {user.isActive ? 'Active' : 'Inactive'}
          </span>
        </Badge>
      ),
    },
    {
      key: 'roles',
      header: 'Roles',
      cell: (user) => (
        <div style={{ display: 'flex', gap: 'var(--space-1)', flexWrap: 'wrap' }}>
          {user.roles.map(role => (
            <Badge key={role} variant={role === 'ADMIN' ? 'danger' : role === 'TEACHER' ? 'info' : role === 'STUDENT' ? 'success' : 'neutral'}>
              {role}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '140px',
      cell: (user) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
          <button
            onClick={() => handleDelete(user)}
            title="Delete user"
            style={{
              padding: '4px 8px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid transparent',
              backgroundColor: 'transparent',
              color: 'var(--color-fg-muted)',
              cursor: 'pointer',
              transition: 'all var(--duration-fast) var(--easing-standard)',
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              fontFamily: 'var(--font-sans)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-danger-light)';
              (e.currentTarget as HTMLElement).style.color = 'var(--color-danger)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgb(239 68 68 / 0.2)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
              (e.currentTarget as HTMLElement).style.color = 'var(--color-fg-muted)';
              (e.currentTarget as HTMLElement).style.borderColor = 'transparent';
            }}
          >
            🗑️
          </button>
          <Button variant="ghost" size="sm" onClick={() => navigate(`/users/${user.id}/edit`)}
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
        title="Users"
        subtitle="Manage all system users, roles, and access permissions"
        icon="👥"
        count={data?.total}
        actions={
          <Button onClick={() => navigate('/users/new')}
            style={{ background: 'var(--color-accent-gradient)', border: 'none', boxShadow: '0 4px 12px rgb(99 102 241 / 0.3)' }}>
            + Add User
          </Button>
        }
      />

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-4)',
        marginBottom: 'var(--space-5)',
      }}>
        <SearchBar
          placeholder="Search by name or email..."
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
          <span style={{ color: 'var(--color-danger)' }}>Failed to load users. Please try again.</span>
        </div>
      ) : (
        <>
          <DataTable
            data={data?.items ?? []}
            columns={columns}
            isLoading={isLoading}
            emptyMessage="No users found. Add your first user to get started."
            emptyIcon="👤"
          />

          {data && data.totalPages > 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 'var(--space-3)',
              marginTop: 'var(--space-5)',
              animation: 'fadeIn var(--duration-base) var(--easing-decelerate)',
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
