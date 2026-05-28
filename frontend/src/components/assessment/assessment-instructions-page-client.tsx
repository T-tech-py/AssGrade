'use client';

import { useEffect, useState } from 'react';
import { getExamById } from '@/data/exam-assessments';
import { AssessmentLayout } from '@/components/assessment/assessment-layout';
import { InstructionCard } from '@/components/assessment/instruction-card';
import { InstructionsStartPanel } from '@/components/assessment/instructions-start-panel';
import {
  type StudentExamSessionResponse,
  getStudentExamSessionRequest,
  mapStudentExamSessionToDefinition,
} from '@/lib/student-dashboard-api';

export function AssessmentInstructionsPageClient({ id }: { id: string }) {
  const [exam, setExam] = useState(() => getExamById(id));
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
        const response: StudentExamSessionResponse =
          await getStudentExamSessionRequest(id);
        if (isCancelled) return;
        setExam(mapStudentExamSessionToDefinition(response));
      } catch (error) {
        if (isCancelled) return;
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'We could not load this assessment right now.',
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
          Loading assessment instructions...
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
            {errorMessage ?? 'We could not find this assessment.'}
          </p>
        </div>
      </AssessmentLayout>
    );
  }

  return (
    <AssessmentLayout>
      <div className="space-y-5">
        <section className="dashboard-panel-strong rounded-[2rem] p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--dashboard-accent-foreground)]">
            Assessment instructions
          </p>
          <h1 className="mt-3 text-[2.3rem] font-semibold tracking-[-0.05em] text-[var(--dashboard-text)] sm:text-[2.9rem]">
            {exam.title}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--dashboard-muted)] sm:text-base">
            {exam.description}
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="dashboard-panel rounded-[1.4rem] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-muted)]">Field</p>
              <p className="mt-2 text-lg font-semibold text-[var(--dashboard-text)]">{exam.field}</p>
            </div>
            <div className="dashboard-panel rounded-[1.4rem] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-muted)]">Duration</p>
              <p className="mt-2 text-lg font-semibold text-[var(--dashboard-text)]">{exam.durationMinutes} mins</p>
            </div>
            <div className="dashboard-panel rounded-[1.4rem] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-muted)]">Questions</p>
              <p className="mt-2 text-lg font-semibold text-[var(--dashboard-text)]">{exam.totalQuestions}</p>
            </div>
            <div className="dashboard-panel rounded-[1.4rem] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-muted)]">Formats</p>
              <p className="mt-2 text-lg font-semibold text-[var(--dashboard-text)]">{exam.formats.join(', ')}</p>
            </div>
          </div>
        </section>

        <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
          <InstructionCard title="Important Instructions" items={exam.instructions} />
          <InstructionCard title="Security Notes" items={exam.securityNotes} tone="security" />
        </div>

        <InstructionsStartPanel href={`/assessments/${exam.id}/take`} />
      </div>
    </AssessmentLayout>
  );
}
