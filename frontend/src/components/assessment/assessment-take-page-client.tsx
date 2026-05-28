'use client';

import { useEffect, useState } from 'react';
import { AssessmentLayout } from '@/components/assessment/assessment-layout';
import { TakeAssessmentPage } from '@/components/assessment/take-assessment-page';
import { getExamById, type ExamDefinition } from '@/data/exam-assessments';
import {
  getStudentExamSessionRequest,
  mapStudentExamSessionToDefinition,
} from '@/lib/student-dashboard-api';

export function AssessmentTakePageClient({ id }: { id: string }) {
  const [exam, setExam] = useState<ExamDefinition | null>(() => getExamById(id) ?? null);
  const [isLoading, setIsLoading] = useState(!getExamById(id));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const loadExam = async () => {
      const mockExam = getExamById(id);
      if (mockExam) {
        if (!isCancelled) {
          setExam(mockExam);
          setIsLoading(false);
        }
        return;
      }

      try {
        const response = await getStudentExamSessionRequest(id);
        if (isCancelled) return;
        setExam(mapStudentExamSessionToDefinition(response));
      } catch (error) {
        if (isCancelled) return;
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'We could not open this assessment session.',
        );
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadExam();

    return () => {
      isCancelled = true;
    };
  }, [id]);

  if (isLoading) {
    return (
      <AssessmentLayout>
        <div className="dashboard-panel-strong rounded-[2rem] p-6 text-sm text-[var(--dashboard-muted)]">
          Loading assessment session...
        </div>
      </AssessmentLayout>
    );
  }

  if (!exam) {
    return (
      <AssessmentLayout>
        <div className="dashboard-panel-strong rounded-[2rem] p-6">
          <p className="text-lg font-semibold text-[var(--dashboard-text)]">Assessment unavailable</p>
          <p className="mt-2 text-sm leading-6 text-[var(--dashboard-muted)]">
            {errorMessage ?? 'We could not open this assessment.'}
          </p>
        </div>
      </AssessmentLayout>
    );
  }

  return <TakeAssessmentPage exam={exam} />;
}
