import { useState, useEffect } from 'react';
import { useClassesList, useClassEnrollments } from '../features/classes/hooks/useClasses';
import { useSubjectsList } from '../features/subjects/hooks/useSubjects';
import { useGrades, useBulkUpsertGrades } from '../features/grades/hooks/useGrades';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { PageHeader } from '../components/PageHeader';
import { toast } from '../store/toast-store';
import { errorMessage } from '../lib/api-error';

export const GradesPage = () => {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear() + '-' + (new Date().getFullYear() + 1));
  const [term, setTerm] = useState('First Semester');
  const [maxScore, setMaxScore] = useState(100);

  const { data: classesData, isLoading: classesLoading } = useClassesList({ page: 1, pageSize: 100, sortBy: 'gradeLevel', sortOrder: 'asc' });
  const { data: subjectsData, isLoading: subjectsLoading } = useSubjectsList({ page: 1, pageSize: 100, sortBy: 'name', sortOrder: 'asc' });
  const { data: enrollments, isLoading: enrollmentsLoading } = useClassEnrollments(selectedClass);
  const { data: gradesData, isLoading: gradesLoading } = useGrades({
    subjectId: selectedSubject || undefined,
    academicYear: academicYear || undefined,
    term: term || undefined,
  });

  const { mutateAsync: saveGrades, isPending: isSaving } = useBulkUpsertGrades();

  const [gradesForm, setGradesForm] = useState<Record<string, { score: number | string }>>({});

  useEffect(() => {
    if (enrollments && !gradesLoading) {
      const newFormState: typeof gradesForm = {};
      let foundMaxScore = null;
      enrollments.forEach(enrollment => {
        const existingRecord = gradesData?.find(g => g.studentId === enrollment.studentId);
        if (existingRecord) {
          newFormState[enrollment.studentId] = { score: existingRecord.score };
          foundMaxScore = existingRecord.maxScore;
        } else {
          newFormState[enrollment.studentId] = { score: '' };
        }
      });
      setGradesForm(newFormState);
      if (foundMaxScore !== null) setMaxScore(foundMaxScore as number);
    }
  }, [enrollments, gradesData, gradesLoading]);

  const handleScoreChange = (studentId: string, val: string) => {
    setGradesForm(prev => ({ ...prev, [studentId]: { ...prev[studentId], score: val } }));
  };

  const handleSave = async () => {
    if (!selectedClass || !selectedSubject || !academicYear || !term) {
      toast.error('Please fill in all required fields');
      return;
    }
    const records = Object.entries(gradesForm)
      .filter(([_, data]) => data.score !== '')
      .map(([studentId, data]) => ({ studentId, score: parseFloat(data.score as string) }))
      .filter(record => !isNaN(record.score));

    if (records.length === 0) {
      toast.error('Please enter at least one valid grade before saving');
      return;
    }

    try {
      await saveGrades({ subjectId: selectedSubject, academicYear, term, maxScore, records });
      toast.success('Grades saved successfully');
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const areFiltersComplete = selectedClass && selectedSubject && academicYear && term;

  const selectStyle: React.CSSProperties = {
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
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 'var(--font-size-xs)',
    fontWeight: 'var(--font-weight-semibold)' as any,
    color: 'var(--color-fg-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: 'var(--space-2)',
  };

  // Grade color coding
  const getScoreColor = (score: number | string) => {
    const num = typeof score === 'string' ? parseFloat(score) : score;
    if (isNaN(num) || score === '') return 'var(--color-fg)';
    const pct = (num / maxScore) * 100;
    if (pct >= 90) return '#10b981';
    if (pct >= 75) return '#3b82f6';
    if (pct >= 60) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div>
      <PageHeader title="Grades Entry" subtitle="Enter and manage student grades by class and subject" icon="📝" />

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
            <label style={labelStyle}>Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              style={selectStyle}
              disabled={classesLoading}
              onFocus={(e) => { e.target.style.borderColor = 'var(--color-accent)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--color-border)'; }}
            >
              <option value="">— Choose a class —</option>
              {classesData?.items.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.gradeLevel}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              style={selectStyle}
              disabled={subjectsLoading}
              onFocus={(e) => { e.target.style.borderColor = 'var(--color-accent)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--color-border)'; }}
            >
              <option value="">— Choose a subject —</option>
              {subjectsData?.items.map(sub => (
                <option key={sub.id} value={sub.id}>{sub.name} ({sub.code})</option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Academic Year</label>
            <Input
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              placeholder="2026-2027"
              style={{ borderRadius: 'var(--radius-lg)' }}
            />
          </div>

          <div>
            <label style={labelStyle}>Term / Semester</label>
            <select
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              style={selectStyle}
              onFocus={(e) => { e.target.style.borderColor = 'var(--color-accent)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--color-border)'; }}
            >
              <option value="First Semester">First Semester</option>
              <option value="Second Semester">Second Semester</option>
              <option value="First Quarter">First Quarter</option>
              <option value="Second Quarter">Second Quarter</option>
              <option value="Third Quarter">Third Quarter</option>
              <option value="Fourth Quarter">Fourth Quarter</option>
              <option value="Final">Final</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grades Form */}
      {areFiltersComplete && (
        <div style={{ animation: 'fadeInUp var(--duration-base) var(--easing-decelerate)' }}>
          {enrollmentsLoading || gradesLoading ? (
            <div style={{
              background: 'var(--color-bg-elevated)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--color-border)',
              padding: 'var(--space-10)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '2rem', marginBottom: 'var(--space-3)', animation: 'pulse 1.5s infinite' }}>📝</div>
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
              <p style={{ color: 'var(--color-fg-muted)' }}>No students enrolled in this class.</p>
            </div>
          ) : (
            <div style={{
              background: 'var(--color-bg-elevated)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-card)',
              overflow: 'hidden',
            }}>
              {/* Header */}
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
                    Score Sheet
                    <span style={{
                      marginLeft: 'var(--space-2)',
                      fontSize: 'var(--font-size-sm)',
                      color: 'var(--color-accent)',
                      fontWeight: 'var(--font-weight-medium)' as any,
                    }}>
                      ({enrollments?.length} students)
                    </span>
                  </h2>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <label style={{
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 'var(--font-weight-semibold)' as any,
                    color: 'var(--color-fg-muted)',
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.05em',
                  }}>
                    Max Score:
                  </label>
                  <Input
                    type="number"
                    value={maxScore}
                    onChange={(e) => setMaxScore(parseInt(e.target.value) || 100)}
                    style={{ width: 80, borderRadius: 'var(--radius-lg)', textAlign: 'center' }}
                  />
                </div>
              </div>

              {/* Table header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 200px',
                padding: 'var(--space-3) var(--space-6)',
                borderBottom: '2px solid var(--color-border)',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 'var(--font-weight-semibold)' as any,
                color: 'var(--color-fg-muted)',
                textTransform: 'uppercase' as const,
                letterSpacing: '0.05em',
              }}>
                <span>Student</span>
                <span style={{ textAlign: 'center' }}>Score</span>
              </div>

              {/* Student rows */}
              <div>
                {enrollments?.map((enrollment, idx) => {
                  const studentId = enrollment.studentId;
                  const record = gradesForm[studentId] || { score: '' };
                  const studentName = `${enrollment.student?.user.firstName} ${enrollment.student?.user.lastName}`;

                  return (
                    <div key={studentId} style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 200px',
                      gap: 'var(--space-4)',
                      alignItems: 'center',
                      padding: 'var(--space-3) var(--space-6)',
                      borderBottom: idx < (enrollments?.length || 0) - 1 ? '1px solid var(--color-border)' : 'none',
                      animation: `fadeIn var(--duration-fast) var(--easing-decelerate) both`,
                      animationDelay: `${idx * 30}ms`,
                      transition: 'background-color var(--duration-fast)',
                    }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-bg-subtle)'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
                    >
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

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)' }}>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="—"
                          value={record.score}
                          onChange={(e) => handleScoreChange(studentId, e.target.value)}
                          style={{
                            width: 80,
                            padding: '6px 10px',
                            fontSize: 'var(--font-size-base)',
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 'var(--font-weight-semibold)' as any,
                            color: getScoreColor(record.score),
                            backgroundColor: 'var(--color-bg)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-md)',
                            outline: 'none',
                            textAlign: 'center',
                            transition: 'border-color var(--duration-fast)',
                          }}
                          onFocus={(e) => { e.target.style.borderColor = 'var(--color-accent)'; }}
                          onBlur={(e) => { e.target.style.borderColor = 'var(--color-border)'; }}
                        />
                        <span style={{
                          color: 'var(--color-fg-subtle)',
                          fontSize: 'var(--font-size-sm)',
                          fontFamily: 'var(--font-mono)',
                        }}>
                          / {maxScore}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Save */}
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
                  💾 Save Grades
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
