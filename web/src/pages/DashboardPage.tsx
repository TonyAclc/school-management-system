import { useNavigate } from 'react-router';
import { useAuthStore } from '../store/auth-store';
import { useUsersList } from '../features/users/hooks/useUsers';
import { useTeachersList } from '../features/teachers/hooks/useTeachers';
import { useStudentsList } from '../features/students/hooks/useStudents';
import { useClassesList } from '../features/classes/hooks/useClasses';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: string;
  gradient: string;
  shadowColor: string;
  onClick?: () => void;
  delay: number;
}

const StatCard = ({ title, value, icon, gradient, shadowColor, onClick, delay }: StatCardProps) => (
  <div
    onClick={onClick}
    style={{
      background: 'var(--color-bg-elevated)',
      borderRadius: 'var(--radius-xl)',
      padding: 'var(--space-6)',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all var(--duration-base) var(--easing-standard)',
      border: '1px solid var(--color-border)',
      boxShadow: 'var(--shadow-card)',
      animation: `fadeInUp var(--duration-slow) var(--easing-decelerate) both`,
      animationDelay: `${delay}ms`,
      position: 'relative' as const,
      overflow: 'hidden',
    }}
    onMouseEnter={(e) => {
      if (onClick) {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
        (e.currentTarget as HTMLElement).style.boxShadow = `var(--shadow-lg), 0 8px 30px ${shadowColor}`;
      }
    }}
    onMouseLeave={(e) => {
      if (onClick) {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-card)';
      }
    }}
  >
    {/* Decorative gradient blob */}
    <div style={{
      position: 'absolute',
      top: -30,
      right: -30,
      width: 100,
      height: 100,
      borderRadius: '50%',
      background: gradient,
      opacity: 0.06,
    }} />
    <div>
      <div style={{
        fontSize: 'var(--font-size-sm)',
        color: 'var(--color-fg-muted)',
        fontWeight: 'var(--font-weight-medium)' as any,
        marginBottom: 'var(--space-2)',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.04em',
      }}>
        {title}
      </div>
      <div style={{
        fontSize: 'var(--font-size-3xl)',
        fontWeight: 'var(--font-weight-bold)' as any,
        color: 'var(--color-fg)',
        lineHeight: 'var(--line-height-tight)',
        animation: 'countUp 0.6s var(--easing-decelerate) both',
        animationDelay: `${delay + 200}ms`,
      }}>
        {value}
      </div>
    </div>
    <div style={{
      width: 48,
      height: 48,
      borderRadius: 'var(--radius-lg)',
      background: gradient,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.5rem',
      flexShrink: 0,
      boxShadow: `0 4px 12px ${shadowColor}`,
    }}>
      {icon}
    </div>
  </div>
);

interface QuickActionProps {
  label: string;
  description: string;
  icon: string;
  onClick: () => void;
  delay: number;
}

const QuickAction = ({ label, description, icon, onClick, delay }: QuickActionProps) => (
  <button
    onClick={onClick}
    style={{
      background: 'var(--color-bg-elevated)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-xl)',
      padding: 'var(--space-5)',
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-4)',
      cursor: 'pointer',
      transition: 'all var(--duration-base) var(--easing-standard)',
      textAlign: 'left' as const,
      width: '100%',
      fontFamily: 'var(--font-sans)',
      animation: `fadeIn var(--duration-base) var(--easing-decelerate) both`,
      animationDelay: `${delay}ms`,
      boxShadow: 'var(--shadow-xs)',
    }}
    onMouseEnter={(e) => {
      (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-accent)';
      (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)';
      (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
    }}
    onMouseLeave={(e) => {
      (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)';
      (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-xs)';
      (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
    }}
  >
    <div style={{
      width: 44,
      height: 44,
      borderRadius: 'var(--radius-lg)',
      backgroundColor: 'var(--color-accent-light)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.3rem',
      flexShrink: 0,
    }}>
      {icon}
    </div>
    <div>
      <div style={{
        fontWeight: 'var(--font-weight-semibold)' as any,
        fontSize: 'var(--font-size-sm)',
        color: 'var(--color-fg)',
        marginBottom: 2,
      }}>
        {label}
      </div>
      <div style={{
        fontSize: 'var(--font-size-xs)',
        color: 'var(--color-fg-muted)',
      }}>
        {description}
      </div>
    </div>
    <span style={{ marginLeft: 'auto', color: 'var(--color-fg-subtle)', fontSize: '1.1rem' }}>→</span>
  </button>
);

export const DashboardPage = () => {
  const user = useAuthStore(s => s.user);
  const navigate = useNavigate();

  // Fetch summary data
  const { data: usersData } = useUsersList({ page: 1, pageSize: 1, sortBy: 'createdAt', sortOrder: 'desc' });
  const { data: teachersData } = useTeachersList({ page: 1, pageSize: 1, sortBy: 'createdAt', sortOrder: 'desc' });
  const { data: studentsData } = useStudentsList({ page: 1, pageSize: 1, sortBy: 'createdAt', sortOrder: 'desc' });
  const { data: classesData } = useClassesList({ page: 1, pageSize: 1, sortBy: 'gradeLevel', sortOrder: 'asc' });

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div>
      {/* Welcome Header */}
      <div style={{
        marginBottom: 'var(--space-8)',
        animation: 'fadeIn var(--duration-slow) var(--easing-decelerate)',
      }}>
        <div style={{
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-fg-muted)',
          fontWeight: 'var(--font-weight-medium)' as any,
          marginBottom: 'var(--space-1)',
        }}>
          {today}
        </div>
        <h1 style={{
          fontSize: 'var(--font-size-3xl)',
          fontWeight: 'var(--font-weight-bold)' as any,
          color: 'var(--color-fg)',
          margin: 0,
          lineHeight: 'var(--line-height-tight)',
        }}>
          {greeting()}, {user?.firstName} 👋
        </h1>
        <p style={{
          color: 'var(--color-fg-muted)',
          fontSize: 'var(--font-size-base)',
          marginTop: 'var(--space-2)',
        }}>
          Here's what's happening with your school today.
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 'var(--space-5)',
        marginBottom: 'var(--space-8)',
      }}>
        <StatCard
          title="Total Users"
          value={usersData?.total ?? '—'}
          icon="👥"
          gradient="linear-gradient(135deg, #6366f1, #8b5cf6)"
          shadowColor="rgb(99 102 241 / 0.25)"
          onClick={() => navigate('/users')}
          delay={0}
        />
        <StatCard
          title="Teachers"
          value={teachersData?.total ?? '—'}
          icon="🎓"
          gradient="linear-gradient(135deg, #10b981, #34d399)"
          shadowColor="rgb(16 185 129 / 0.25)"
          onClick={() => navigate('/teachers')}
          delay={80}
        />
        <StatCard
          title="Students"
          value={studentsData?.total ?? '—'}
          icon="🧑‍🎓"
          gradient="linear-gradient(135deg, #f59e0b, #fbbf24)"
          shadowColor="rgb(245 158 11 / 0.25)"
          onClick={() => navigate('/students')}
          delay={160}
        />
        <StatCard
          title="Classes"
          value={classesData?.total ?? '—'}
          icon="🏫"
          gradient="linear-gradient(135deg, #3b82f6, #60a5fa)"
          shadowColor="rgb(59 130 246 / 0.25)"
          onClick={() => navigate('/classes')}
          delay={240}
        />
      </div>

      {/* Bottom Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 'var(--space-6)',
      }}>
        {/* Quick Actions */}
        <div style={{
          animation: 'fadeInUp var(--duration-slow) var(--easing-decelerate) both',
          animationDelay: '300ms',
        }}>
          <h2 style={{
            fontSize: 'var(--font-size-lg)',
            fontWeight: 'var(--font-weight-semibold)' as any,
            color: 'var(--color-fg)',
            marginBottom: 'var(--space-4)',
          }}>
            Quick Actions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <QuickAction
              label="Add New Student"
              description="Enroll a new student in the system"
              icon="➕"
              onClick={() => navigate('/students/new')}
              delay={400}
            />
            <QuickAction
              label="Take Attendance"
              description="Record attendance for a class"
              icon="📋"
              onClick={() => navigate('/attendance')}
              delay={480}
            />
            <QuickAction
              label="Enter Grades"
              description="Input grades for students"
              icon="📝"
              onClick={() => navigate('/grades')}
              delay={560}
            />
            <QuickAction
              label="Create a Class"
              description="Set up a new class section"
              icon="🏫"
              onClick={() => navigate('/classes/new')}
              delay={640}
            />
          </div>
        </div>

        {/* Activity / Info Panel */}
        <div style={{
          animation: 'fadeInUp var(--duration-slow) var(--easing-decelerate) both',
          animationDelay: '400ms',
        }}>
          <h2 style={{
            fontSize: 'var(--font-size-lg)',
            fontWeight: 'var(--font-weight-semibold)' as any,
            color: 'var(--color-fg)',
            marginBottom: 'var(--space-4)',
          }}>
            System Overview
          </h2>

          <div style={{
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-card)',
          }}>
            {/* Info rows */}
            {[
              { label: 'Academic Year', value: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`, icon: '📅' },
              { label: 'Your Role', value: user?.roles.join(', ') ?? 'N/A', icon: '🔑' },
              { label: 'System Status', value: 'Operational', icon: '✅' },
              { label: 'Current Term', value: 'First Semester', icon: '📚' },
            ].map((item, idx) => (
              <div key={item.label} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--space-4) var(--space-5)',
                borderBottom: idx < 3 ? '1px solid var(--color-border)' : 'none',
                animation: `slideInRight var(--duration-base) var(--easing-decelerate) both`,
                animationDelay: `${500 + idx * 80}ms`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                  <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-fg-muted)' }}>
                    {item.label}
                  </span>
                </div>
                <span style={{
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-semibold)' as any,
                  color: 'var(--color-fg)',
                }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          {/* Tips card */}
          <div style={{
            marginTop: 'var(--space-4)',
            background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)',
            border: '1px solid rgb(99 102 241 / 0.15)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-5)',
            animation: 'fadeIn var(--duration-slow) var(--easing-decelerate) both',
            animationDelay: '800ms',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 'var(--space-3)',
            }}>
              <span style={{ fontSize: '1.5rem' }}>💡</span>
              <div>
                <div style={{
                  fontWeight: 'var(--font-weight-semibold)' as any,
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-accent-hover)',
                  marginBottom: 'var(--space-1)',
                }}>
                  Pro Tip
                </div>
                <div style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-fg-muted)',
                  lineHeight: 'var(--line-height-relaxed)',
                }}>
                  Use the sidebar navigation to quickly access any module. Start by adding teachers, 
                  then create classes and enroll students for a complete setup.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
