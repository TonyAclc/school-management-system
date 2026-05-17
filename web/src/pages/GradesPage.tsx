import { useState, useEffect } from 'react';
import { useClassesList, useClassEnrollments } from '../features/classes/hooks/useClasses';
import { useSubjectsList } from '../features/subjects/hooks/useSubjects';
import { useGrades, useBulkUpsertGrades } from '../features/grades/hooks/useGrades';
import { Button } from '../components/Button';
import { FormField } from '../components/FormField';
import { Input } from '../components/Input';
import { toast } from '../store/toast-store';
import { errorMessage } from '../lib/api-error';

export const GradesPage = () => {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear() + '-' + (new Date().getFullYear() + 1));
  const [term, setTerm] = useState('First Semester');
  const [maxScore, setMaxScore] = useState(100);

  // Fetch classes for dropdown
  const { data: classesData, isLoading: classesLoading } = useClassesList({ page: 1, pageSize: 100, sortBy: 'gradeLevel', sortOrder: 'asc' });
  
  // Fetch subjects for dropdown
  const { data: subjectsData, isLoading: subjectsLoading } = useSubjectsList({ page: 1, pageSize: 100, sortBy: 'name', sortOrder: 'asc' });

  // Fetch enrolled students for the selected class
  const { data: enrollments, isLoading: enrollmentsLoading } = useClassEnrollments(selectedClass);
  
  // Fetch existing grades for the selected subject, year, term
  const { data: gradesData, isLoading: gradesLoading } = useGrades({
    subjectId: selectedSubject || undefined,
    academicYear: academicYear || undefined,
    term: term || undefined,
  });

  const { mutateAsync: saveGrades, isPending: isSaving } = useBulkUpsertGrades();

  // Local state for the grades form: Record<studentId, { score: number | string }>
  const [gradesForm, setGradesForm] = useState<Record<string, { score: number | string }>>({});

  // Sync existing grades into the local form state
  useEffect(() => {
    if (enrollments && !gradesLoading) {
      const newFormState: typeof gradesForm = {};
      
      // Keep track if we found any maxScore to update the global maxScore state
      let foundMaxScore = null;

      enrollments.forEach(enrollment => {
        // Find existing record if it exists
        const existingRecord = gradesData?.find(g => g.studentId === enrollment.studentId);
        
        if (existingRecord) {
          newFormState[enrollment.studentId] = {
            score: existingRecord.score,
          };
          foundMaxScore = existingRecord.maxScore;
        } else {
          newFormState[enrollment.studentId] = {
            score: '',
          };
        }
      });
      
      setGradesForm(newFormState);
      if (foundMaxScore !== null) {
        setMaxScore(foundMaxScore as number);
      }
    }
  }, [enrollments, gradesData, gradesLoading]);

  const handleScoreChange = (studentId: string, val: string) => {
    setGradesForm(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        score: val,
      }
    }));
  };

  const handleSave = async () => {
    if (!selectedClass || !selectedSubject || !academicYear || !term) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Filter out empty scores and parse them to numbers
    const records = Object.entries(gradesForm)
      .filter(([_, data]) => data.score !== '')
      .map(([studentId, data]) => ({
        studentId,
        score: parseFloat(data.score as string),
      }))
      .filter(record => !isNaN(record.score));

    if (records.length === 0) {
      toast.error('Please enter at least one valid grade before saving');
      return;
    }

    try {
      await saveGrades({
        subjectId: selectedSubject,
        academicYear,
        term,
        maxScore,
        records,
      });
      toast.success('Grades saved successfully');
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const areFiltersComplete = selectedClass && selectedSubject && academicYear && term;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)' }}>Grades Entry</h1>
      </div>

      {/* Controls Container */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', backgroundColor: 'var(--color-bg-elevated)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-6)' }}>
        <FormField label="Select Class" htmlFor="classId">
          <select 
            id="classId" 
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            style={{ width: '100%', padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', fontSize: 'var(--font-size-md)', color: 'var(--color-fg)' }}
            disabled={classesLoading}
          >
            <option value="">-- Choose a class --</option>
            {classesData?.items.map(cls => (
              <option key={cls.id} value={cls.id}>{cls.gradeLevel}</option>
            ))}
          </select>
        </FormField>

        <FormField label="Select Subject" htmlFor="subjectId">
          <select 
            id="subjectId" 
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            style={{ width: '100%', padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', fontSize: 'var(--font-size-md)', color: 'var(--color-fg)' }}
            disabled={subjectsLoading}
          >
            <option value="">-- Choose a subject --</option>
            {subjectsData?.items.map(sub => (
              <option key={sub.id} value={sub.id}>{sub.name} ({sub.code})</option>
            ))}
          </select>
        </FormField>

        <FormField label="Academic Year" htmlFor="academicYear">
          <Input id="academicYear" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} placeholder="2026-2027" />
        </FormField>

        <FormField label="Term / Semester" htmlFor="term">
          <select 
            id="term" 
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            style={{ width: '100%', padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', fontSize: 'var(--font-size-md)', color: 'var(--color-fg)' }}
          >
            <option value="First Semester">First Semester</option>
            <option value="Second Semester">Second Semester</option>
            <option value="First Quarter">First Quarter</option>
            <option value="Second Quarter">Second Quarter</option>
            <option value="Third Quarter">Third Quarter</option>
            <option value="Fourth Quarter">Fourth Quarter</option>
            <option value="Final">Final</option>
          </select>
        </FormField>
      </div>

      {/* Grades Form */}
      {areFiltersComplete && (
        <div style={{ backgroundColor: 'var(--color-bg-elevated)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)' }}>
          {enrollmentsLoading || gradesLoading ? (
            <p style={{ textAlign: 'center', color: 'var(--color-fg-muted)', padding: 'var(--space-6)' }}>Loading student records...</p>
          ) : enrollments?.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--color-fg-muted)', padding: 'var(--space-6)' }}>No students enrolled in this class.</p>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                <h2 style={{ fontSize: 'var(--font-size-lg)' }}>Enrolled Students ({enrollments?.length})</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <label htmlFor="maxScore" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>Max Score:</label>
                  <Input 
                    id="maxScore" 
                    type="number" 
                    value={maxScore} 
                    onChange={(e) => setMaxScore(parseInt(e.target.value) || 100)} 
                    style={{ width: '80px' }} 
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {enrollments?.map(enrollment => {
                  const studentId = enrollment.studentId;
                  const record = gradesForm[studentId] || { score: '' };
                  const studentName = `${enrollment.student?.user.firstName} ${enrollment.student?.user.lastName}`;
                  
                  return (
                    <div key={studentId} style={{ display: 'grid', gridTemplateColumns: '1fr 150px', gap: 'var(--space-4)', alignItems: 'center', padding: 'var(--space-3)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                      <div>
                        <div style={{ fontWeight: 'var(--font-weight-medium)' }}>{studentName}</div>
                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-fg-muted)' }}>{enrollment.student?.studentNumber}</div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <Input 
                          type="number" 
                          step="0.01"
                          placeholder="Score" 
                          value={record.score}
                          onChange={(e) => handleScoreChange(studentId, e.target.value)}
                        />
                        <span style={{ color: 'var(--color-fg-muted)' }}>/ {maxScore}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-6)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)' }}>
                <Button onClick={handleSave} isLoading={isSaving} size="lg">
                  Save Grades
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
