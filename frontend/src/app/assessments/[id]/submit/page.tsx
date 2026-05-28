import Link from 'next/link';
import { AssessmentLayout } from '@/components/assessment/assessment-layout';
import { CheckIcon } from '@/components/assessment/icons';
import { PassConfetti } from '@/components/assessment/pass-confetti';
import { getExamById } from '@/data/exam-assessments';

type SubmitPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    score?: string;
    maxScore?: string;
    percentage?: string;
    grade?: string;
    passed?: string;
    certificate?: string;
  }>;
};

export default async function AssessmentSubmitPage({
  params,
  searchParams,
}: SubmitPageProps) {
  const { id } = await params;
  const { score, maxScore, percentage, grade, passed, certificate } = await searchParams;
  const exam = getExamById(id);
  const assessmentTitle = exam?.title ?? 'this assessment';
  const scoreValue = score ?? '0';
  const maxScoreValue = maxScore ?? '0';
  const percentageValue = percentage ?? '0';
  const numericPercentage = Number(percentageValue) || 0;
  const gradeValue =
    grade ??
    (numericPercentage >= 90
      ? 'Excellent'
      : numericPercentage >= 80
        ? 'Credit'
        : numericPercentage >= 70
          ? 'Passed'
          : numericPercentage >= 50
            ? 'Fairly passed'
            : 'Fail');
  const passedValue = passed === 'true';

  return (
    <AssessmentLayout>
      <div className="grid min-h-[calc(100vh-4rem)] place-items-center">
        <section className="dashboard-panel-strong relative w-full max-w-2xl overflow-hidden rounded-[2rem] p-8 text-center">
          {passedValue ? <PassConfetti /> : null}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-[var(--dashboard-accent-soft)] text-[var(--dashboard-accent-foreground)]">
            <CheckIcon className="h-7 w-7" />
          </div>
          <h1 className="mt-5 text-[2.2rem] font-semibold tracking-[-0.05em] text-[var(--dashboard-text)]">
            Your assessment has been submitted successfully.
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[var(--dashboard-muted)] sm:text-base">
            Your responses for {assessmentTitle} have been graded. Here is your result summary immediately after submission.
          </p>

          <div className="mt-6 grid gap-3 text-left sm:grid-cols-3">
            <div className="dashboard-panel rounded-[1.4rem] px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-muted)]">Score</p>
              <p className="mt-2 text-2xl font-semibold text-[var(--dashboard-text)]">
                {scoreValue}/{maxScoreValue}
              </p>
            </div>
            <div className="dashboard-panel rounded-[1.4rem] px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-muted)]">Percentage</p>
              <p className="mt-2 text-2xl font-semibold text-[var(--dashboard-text)]">
                {percentageValue}%
              </p>
            </div>
            <div className="dashboard-panel rounded-[1.4rem] px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-muted)]">Outcome</p>
              <p
                className={`mt-2 text-2xl font-semibold ${
                  passedValue
                    ? 'text-[var(--dashboard-accent-foreground)]'
                    : 'text-[var(--dashboard-warm-foreground)]'
                }`}
              >
                {gradeValue}
              </p>
            </div>
          </div>

          <div className="dashboard-soft-tile mt-5 rounded-[1.4rem] px-4 py-4 text-left">
            <p className="text-sm font-semibold text-[var(--dashboard-text)]">
              {passedValue
                ? 'You met the certificate eligibility threshold on this assessment.'
                : gradeValue === 'Fairly passed'
                  ? 'You scored in the fairly passed band, but this is still below certificate eligibility.'
                  : 'You did not reach the certificate eligibility threshold on this attempt.'}
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--dashboard-muted)]">
              {passedValue
                ? certificate
                  ? `A certificate has been issued for this result with verification ID ${certificate}.`
                  : 'Your result met the required 70% certificate threshold.'
                : 'Use the feedback from your dashboard, practice mode, and results history to improve before the next attempt.'}
            </p>
          </div>

          <Link href="/dashboard" className="dashboard-lime-panel mt-6 inline-flex rounded-2xl px-5 py-3.5 text-sm font-semibold text-[#203100]">
            Back to Dashboard
          </Link>
        </section>
      </div>
    </AssessmentLayout>
  );
}
