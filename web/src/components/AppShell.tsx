import { Outlet, useNavigate, useLocation } from 'react-router';
import { useAuthStore } from '../store/auth-store';
import { authService } from '../features/auth/services/auth.service';
import { Button } from './Button';
import { toast } from '../store/toast-store';

export const AppShell = () => {
  const user = useAuthStore(s => s.user);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/login');
    } catch {
      toast.error('Failed to logout cleanly');
    }
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', roles: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT', 'STAFF'] },
    { label: 'Users', path: '/users', roles: ['ADMIN'] },
    { label: 'Teachers', path: '/teachers', roles: ['ADMIN'] },
    { label: 'Students', path: '/students', roles: ['ADMIN', 'TEACHER'] },
    { label: 'Classes', path: '/classes', roles: ['ADMIN', 'TEACHER'] },
    { label: 'Attendance', path: '/attendance', roles: ['ADMIN', 'TEACHER'] },
    { label: 'Grades', path: '/grades', roles: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'] },
  ];

  const visibleNavItems = navItems.filter(item => 
    item.roles.some(r => user?.roles.includes(r as any))
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
      {/* Sidebar */}
      <aside style={{ 
        width: 'var(--sidebar-width)', 
        backgroundColor: 'var(--color-bg-elevated)', 
        borderRight: '1px solid var(--color-bg-muted)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--color-bg-muted)' }}>
          <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-accent)' }}>
            EduManage
          </h2>
        </div>
        
        <nav style={{ flex: 1, padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
          {visibleNavItems.map(item => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <a
                key={item.path}
                href={item.path}
                onClick={(e) => { e.preventDefault(); navigate(item.path); }}
                style={{
                  padding: 'var(--space-2) var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  color: isActive ? 'var(--color-accent)' : 'var(--color-fg-muted)',
                  backgroundColor: isActive ? 'var(--color-bg)' : 'transparent',
                  fontWeight: isActive ? 'var(--font-weight-medium)' : 'normal',
                  textDecoration: 'none',
                  transition: 'background-color var(--duration-fast)',
                }}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        <div style={{ padding: 'var(--space-4)', borderTop: '1px solid var(--color-bg-muted)' }}>
          <div style={{ marginBottom: 'var(--space-3)' }}>
            <div style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-sm)' }}>
              {user?.firstName} {user?.lastName}
            </div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-fg-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.email}
            </div>
          </div>
          <Button variant="secondary" size="sm" fullWidth onClick={handleLogout}>
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{ 
          height: 'var(--header-height)', 
          backgroundColor: 'var(--color-bg-elevated)', 
          borderBottom: '1px solid var(--color-bg-muted)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 var(--space-6)'
        }}>
          {/* Header content (breadcrumbs, search, etc.) could go here */}
        </header>
        
        <div style={{ flex: 1, overflow: 'auto', padding: 'var(--space-6)' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};
