import { useState, useEffect } from 'react';
import { useClassesList, useClassEnrollments } from '../features/classes/hooks/useClasses';
import { useAttendance, useBulkUpsertAttendance } from '../features/attendance/hooks/useAttendance';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { PageHeader } from '../components/PageHeader';
import { toast } from '../store/toast-store';
import { errorMessage } from '../lib/api-error';

const STATUS_CONFIG = {
  PRESENT: { label: 'Present', color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0' },
  LATE:    { label: 'Late',    color: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
  ABSENT:  { label: 'Absent',  color: '#ef4444', bg: '#fef2f2', border: '#fecaca' },
  EXCUSED: { label: 'Excused', color: '#6366f1', bg: '#eef2ff', border: '#c7d2fe' },
} as const;

export const AttendancePage = () => {
  const [selectedClass, setSelectedClass] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: classesData, isLoading: classesLoading } = useClassesList({ page: 1, pageSize: 100, sortBy: 'gradeLevel', sortOrder: 'asc' });
  const { data: enrollments, isLoading: enrollmentsLoading } = useClassEnrollments(selectedClass);
  const { data: attendanceData, isLoading: attendanceLoading } = useAttendance({ classId: selectedClass, date });
  const { mutateAsync: saveAttendance, isPending: isSaving } = useBulkUpsertAttendance();

  const [attendanceForm, setAttendanceForm] = useState<Record<string, { status: 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED'; notes: string }>>({});

  useEffect(() => {
    if (enrollments && !attendanceLoading) {
      const newFormState: typeof attendanceForm = {};
      enrollments.forEach(enrollment => {
        const existingRecord = attendanceData?.find(a => a.studentId === enrollment.studentId);
        if (existingRecord) {
          newFormState[enrollment.studentId] = { status: existingRecord.status, notes: existingRecord.notes || '' };
        } else {
          newFormState[enrollment.studentId] = { status: 'PRESENT', notes: '' };
        }
      });
      setAttendanceForm(newFormState);
    }
  }, [enrollments, attendanceData, attendanceLoading]);

  const handleStatusChange = (studentId: string, status: 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED') => {
    setAttendanceForm(prev => ({ ...prev, [studentId]: { ...prev[studentId], status } }));
  };

  const handleNotesChange = (studentId: string, notes: string) => {
    setAttendanceForm(prev => ({ ...prev, [studentId]: { ...prev[studentId], notes } }));
  };

  const handleSave = async () => {
    if (!selectedClass || !date) return;
    const records = Object.entries(attendanceForm).map(([studentId, data]) => ({
      studentId, status: data.status, notes: data.notes || null,
    }));
    try {
      await saveAttendance({ classId: selectedClass, date, records });
      toast.success('Attendance saved successfully');
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const markAllAs = (status: 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED') => {
    setAttendanceForm(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(studentId => { next[studentId] = { ...next[studentId], status }; });
      return next;
    });
  };

  // Stats
  const stats = Object.values(attendanceForm).reduce(
    (acc, { status }) => { acc[status] = (acc[status] || 0) + 1; return acc; },
    {} as Record<string, number>
  );

  return (
    <div>
      <PageHeader title="Attendance" subtitle="Record and manage daily student attendance" icon="📋" />

      {/* Filter Card */}
      <div style={{
        background: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-6)',
        marginBottom: 'var(--space-6)',
        boxShadow: 'var(--shadow-card)',
        animation: 'fadeIn var(--duration-base) var(--easing-decelerate)',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--space-5)',
        }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: 'var(--font-size-xs)',
              fontWeight: 'var(--font-weight-semibold)' as any,
              color: 'var(--color-fg-muted)',
              textTransform: 'uppercase' as const,
              letterSpacing: '0.05em',
              marginBottom: 'var(--space-2)',
            }}>
              Select Class
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              disabled={classesLoading}
              style={{
                width: '100%',
                padding: 'var(--space-2) var(--space-3)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-bg)',
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-fg)',
                fontFamily: 'var(--font-sans)',
                outline: 'none',
                transition: 'border-color var(--duration-fast)',
                cursor: 'pointer',
              }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--color-accent)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--color-border)'; }}
            >
              <option value="">— Choose a class —</option>
              {classesData?.items.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.gradeLevel} ({cls.academicYear})</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: 'var(--font-size-xs)',
              fontWeight: 'var(--font-weight-semibold)' as any,
              color: 'var(--color-fg-muted)',
              textTransform: 'uppercase' as const,
              letterSpacing: '0.05em',
              marginBottom: 'var(--space-2)',
            }}>
              Date
            </label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ borderRadius: 'var(--radius-lg)' }}
            />
          </div>
        </div>
      </div>

      {/* Attendance Form */}
      {selectedClass && (
        <div style={{ animation: 'fadeInUp var(--duration-base) var(--easing-decelerate)' }}>
          {enrollmentsLoading || attendanceLoading ? (
            <div style={{
              background: 'var(--color-bg-elevated)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--color-border)',
              padding: 'var(--space-10)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '2rem', marginBottom: 'var(--space-3)', animation: 'pulse 1.5s infinite' }}>📋</div>
              <p style={{ color: 'var(--color-fg-muted)' }}>Loading student records...</p>
            </div>
          ) : enrollments?.length === 0 ? (
            <div style={{
              background: 'var(--color-bg-elevated)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--color-border)',
              padding: 'var(--space-16)',
              textAlign: 'center',
              boxShadow: 'var(--shadow-card)',
            }}>
              <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)', opacity: 0.6 }}>📭</div>
              <p style={{ color: 'var(--color-fg-muted)', fontSize: 'var(--font-size-base)' }}>
                No students enrolled in this class yet.
              </p>
            </div>
          ) : (
            <div style={{
              background: 'var(--color-bg-elevated)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-card)',
              overflow: 'hidden',
            }}>
              {/* Header with stats */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 'var(--space-5) var(--space-6)',
                borderBottom: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-bg-subtle)',
              }}>
                <div>
                  <h2 style={{
                    fontSize: 'var(--font-size-lg)',
                    fontWeight: 'var(--font-weight-semibold)' as any,
                    color: 'var(--color-fg)',
                    margin: 0,
                  }}>
                    Student Roster
                    <span style={{
                      marginLeft: 'var(--space-2)',
                      fontSize: 'var(--font-size-sm)',
                      color: 'var(--color-accent)',
                      fontWeight: 'var(--font-weight-medium)' as any,
                    }}>
                      ({enrollments?.length})
                    </span>
                  </h2>
                  {/* Status summary */}
                  <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-2)' }}>
                    {(Object.entries(STATUS_CONFIG) as [keyof typeof STATUS_CONFIG, typeof STATUS_CONFIG[keyof typeof STATUS_CONFIG]][]).map(([key, cfg]) => (
                      <span key={key} style={{
                        fontSize: 'var(--font-size-xs)',
                        color: cfg.color,
                        fontWeight: 'var(--font-weight-medium)' as any,
                      }}>
                        {cfg.label}: {stats[key] || 0}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <Button variant="secondary" size="sm" onClick={() => markAllAs('PRESENT')}
                    style={{ borderRadius: 'var(--radius-lg)', fontSize: 'var(--font-size-xs)' }}>
                    ✅ All Present
                  </Button>
                </div>
              </div>

              {/* Student rows */}
              <div>
                {enrollments?.map((enrollment, idx) => {
                  const studentId = enrollment.studentId;
                  const record = attendanceForm[studentId] || { status: 'PRESENT', notes: '' };
                  const studentName = `${enrollment.student?.user.firstName} ${enrollment.student?.user.lastName}`;

                  return (
                    <div key={studentId} style={{
                      display: 'grid',
                      gridTemplateColumns: '220px 1fr auto',
                      gap: 'var(--space-4)',
                      alignItems: 'center',
                      padding: 'var(--space-4) var(--space-6)',
                      borderBottom: idx < (enrollments?.length || 0) - 1 ? '1px solid var(--color-border)' : 'none',
                      animation: `fadeIn var(--duration-fast) var(--easing-decelerate) both`,
                      animationDelay: `${idx * 30}ms`,
                      transition: 'background-color var(--duration-fast)',
                    }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-bg-subtle)'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
                    >
                      {/* Student info */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <div style={{
                          width: 32,
                          height: 32,
                          borderRadius: 'var(--radius-full)',
                          background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.6875rem',
                          fontWeight: 'var(--font-weight-bold)' as any,
                          color: 'white',
                          flexShrink: 0,
                        }}>
                          {enrollment.student?.user.firstName?.[0]}{enrollment.student?.user.lastName?.[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: 'var(--font-weight-medium)' as any, fontSize: 'var(--font-size-sm)' }}>
                            {studentName}
                          </div>
                          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-fg-muted)' }}>
                            {enrollment.student?.studentNumber}
                          </div>
                        </div>
                      </div>

                      {/* Status buttons */}
                      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        {(Object.entries(STATUS_CONFIG) as [keyof typeof STATUS_CONFIG, typeof STATUS_CONFIG[keyof typeof STATUS_CONFIG]][]).map(([key, cfg]) => {
                          const isSelected = record.status === key;
                          return (
                            <button
                              key={key}
                              onClick={() => handleStatusChange(studentId, key)}
                              style={{
                                padding: '4px 12px',
                                borderRadius: 'var(--radius-full)',
                                border: `1.5px solid ${isSelected ? cfg.border : 'var(--color-border)'}`,
                                backgroundColor: isSelected ? cfg.bg : 'transparent',
                                color: isSelected ? cfg.color : 'var(--color-fg-muted)',
                                fontSize: 'var(--font-size-xs)',
                                fontWeight: isSelected ? 'var(--font-weight-semibold)' : 'var(--font-weight-medium)',
                                cursor: 'pointer',
                                transition: 'all var(--duration-fast) var(--easing-standard)',
                                fontFamily: 'var(--font-sans)',
                              } as any}
                              onMouseEnter={(e) => {
                                if (!isSelected) {
                                  (e.currentTarget as HTMLElement).style.borderColor = cfg.border;
                                  (e.currentTarget as HTMLElement).style.backgroundColor = cfg.bg;
                                  (e.currentTarget as HTMLElement).style.color = cfg.color;
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!isSelected) {
                                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)';
                                  (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                                  (e.currentTarget as HTMLElement).style.color = 'var(--color-fg-muted)';
                                }
                              }}
                            >
                              {cfg.label}
                            </button>
                          );
                        })}
                      </div>

                      {/* Notes */}
                      <input
                        placeholder="Notes..."
                        value={record.notes}
                        onChange={(e) => handleNotesChange(studentId, e.target.value)}
                        style={{
                          width: 140,
                          padding: '4px 10px',
                          fontSize: 'var(--font-size-xs)',
                          fontFamily: 'var(--font-sans)',
                          color: 'var(--color-fg)',
                          backgroundColor: 'var(--color-bg)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-md)',
                          outline: 'none',
                          transition: 'border-color var(--duration-fast)',
                        }}
                        onFocus={(e) => { e.target.style.borderColor = 'var(--color-accent)'; }}
                        onBlur={(e) => { e.target.style.borderColor = 'var(--color-border)'; }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Save button */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                padding: 'var(--space-5) var(--space-6)',
                borderTop: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-bg-subtle)',
              }}>
                <Button onClick={handleSave} isLoading={isSaving}
                  style={{
                    background: 'var(--color-accent-gradient)',
                    border: 'none',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: '0 4px 12px rgb(99 102 241 / 0.3)',
                    padding: 'var(--space-3) var(--space-8)',
                  }}>
                  💾 Save Attendance
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
