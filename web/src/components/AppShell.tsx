import { Outlet, useNavigate, useLocation } from 'react-router';
import { useAuthStore } from '../store/auth-store';
import { authService } from '../features/auth/services/auth.service';
import { toast } from '../store/toast-store';

const NAV_ICONS: Record<string, string> = {
  Dashboard: '📊',
  Users: '👥',
  Teachers: '🎓',
  Students: '👦',
  Classes: '🏫',
  Attendance: '📋',
  Grades: '📝',
};

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

  const getInitials = () => {
    if (!user) return '?';
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
      {/* Sidebar */}
      <aside style={{
        width: 'var(--sidebar-width)',
        background: 'linear-gradient(180deg, #1e1b4b 0%, #312e81 50%, #3730a3 100%)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 'var(--z-sidebar)' as any,
        boxShadow: '4px 0 24px rgb(0 0 0 / 0.15)',
      }}>
        {/* Logo */}
        <div style={{
          padding: 'var(--space-6) var(--space-5)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
        }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, #818cf8, #c084fc)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem',
            fontWeight: 'var(--font-weight-bold)' as any,
            color: 'white',
            boxShadow: '0 4px 12px rgb(129 140 248 / 0.4)',
          }}>
            E
          </div>
          <div>
            <div style={{
              fontSize: 'var(--font-size-lg)',
              fontWeight: 'var(--font-weight-bold)' as any,
              color: 'white',
              letterSpacing: '-0.02em',
            }}>
              EduManage
            </div>
            <div style={{
              fontSize: '0.6875rem',
              color: 'rgb(199 210 254 / 0.6)',
              fontWeight: 'var(--font-weight-medium)' as any,
              letterSpacing: '0.05em',
              textTransform: 'uppercase' as const,
            }}>
              School System
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{
          flex: 1,
          padding: 'var(--space-2) var(--space-3)',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          overflowY: 'auto',
        }}>
          <div style={{
            padding: 'var(--space-2) var(--space-3)',
            fontSize: '0.6875rem',
            fontWeight: 'var(--font-weight-semibold)' as any,
            color: 'rgb(199 210 254 / 0.4)',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.08em',
            marginBottom: 'var(--space-1)',
          }}>
            Main Menu
          </div>
          {visibleNavItems.map(item => {
            const isActive = location.pathname === item.path || 
                            (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            return (
              <a
                key={item.path}
                href={item.path}
                onClick={(e) => { e.preventDefault(); navigate(item.path); }}
                style={{
                  padding: 'var(--space-2) var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  color: isActive ? 'white' : 'rgb(199 210 254 / 0.7)',
                  backgroundColor: isActive ? 'rgb(255 255 255 / 0.12)' : 'transparent',
                  fontWeight: isActive ? 'var(--font-weight-semibold)' : 'var(--font-weight-medium)',
                  textDecoration: 'none',
                  transition: 'all var(--duration-fast) var(--easing-standard)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  fontSize: 'var(--font-size-sm)',
                  position: 'relative' as const,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'rgb(255 255 255 / 0.06)';
                    (e.currentTarget as HTMLElement).style.color = 'white';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                    (e.currentTarget as HTMLElement).style.color = 'rgb(199 210 254 / 0.7)';
                  }
                }}
              >
                {isActive && (
                  <div style={{
                    position: 'absolute',
                    left: '-12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 3,
                    height: 20,
                    borderRadius: '0 3px 3px 0',
                    background: 'linear-gradient(180deg, #818cf8, #c084fc)',
                  }} />
                )}
                <span style={{ fontSize: '1.1rem', width: 24, textAlign: 'center' as const }}>
                  {NAV_ICONS[item.label] || '📄'}
                </span>
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* User section */}
        <div style={{
          padding: 'var(--space-4) var(--space-4)',
          borderTop: '1px solid rgb(255 255 255 / 0.08)',
          margin: '0 var(--space-2)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-3)',
          }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, #818cf8, #c084fc)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-bold)' as any,
              color: 'white',
              flexShrink: 0,
            }}>
              {getInitials()}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{
                fontWeight: 'var(--font-weight-semibold)' as any,
                fontSize: 'var(--font-size-sm)',
                color: 'white',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap' as const,
              }}>
                {user?.firstName} {user?.lastName}
              </div>
              <div style={{
                fontSize: '0.6875rem',
                color: 'rgb(199 210 254 / 0.5)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap' as const,
              }}>
                {user?.email}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: 'var(--space-2) var(--space-3)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgb(255 255 255 / 0.12)',
              backgroundColor: 'rgb(255 255 255 / 0.05)',
              color: 'rgb(199 210 254 / 0.8)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-medium)' as any,
              cursor: 'pointer',
              transition: 'all var(--duration-fast) var(--easing-standard)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-2)',
              fontFamily: 'var(--font-sans)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'rgb(255 255 255 / 0.1)';
              (e.currentTarget as HTMLElement).style.color = 'white';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'rgb(255 255 255 / 0.05)';
              (e.currentTarget as HTMLElement).style.color = 'rgb(199 210 254 / 0.8)';
            }}
          >
            <span style={{ fontSize: '1rem' }}>🚪</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{
        flex: 1,
        marginLeft: 'var(--sidebar-width)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}>
        <div style={{
          flex: 1,
          padding: 'var(--space-8)',
          maxWidth: 1400,
          width: '100%',
          margin: '0 auto',
        }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};
