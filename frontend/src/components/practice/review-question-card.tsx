import type { PracticeReviewQuestion } from '@/data/practice-mode';
import { BookIcon, CheckCircleIcon, CodeIcon, MessageIcon, SparklesIcon } from './practice-icons';

type ReviewQuestionCardProps = {
  question: PracticeReviewQuestion;
};

export function ReviewQuestionCard({ question }: ReviewQuestionCardProps) {
  const typeIcon =
    question.type === 'Coding' ? <CodeIcon className="h-3.5 w-3.5" /> : question.type === 'Theory' ? <MessageIcon className="h-3.5 w-3.5" /> : <CheckCircleIcon className="h-3.5 w-3.5" />;

  return (
    <div className="practice-panel rounded-[1.7rem] p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-[var(--practice-soft-bg)] px-3 py-1.5 text-xs font-semibold text-[var(--practice-text)]">
          Question {question.number}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--practice-accent-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--practice-accent-foreground)]">
          {typeIcon}
          {question.type}
        </span>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
            question.outcome === 'Correct'
              ? 'bg-[rgba(76,164,106,0.14)] text-[#2e7b4b]'
              : 'bg-[rgba(175,77,48,0.12)] text-[#a74a2b]'
          }`}
        >
          <SparklesIcon className="h-3.5 w-3.5" />
          {question.outcome}
        </span>
      </div>

      <h3 className="mt-4 text-lg font-semibold text-[var(--practice-text)]">{question.prompt}</h3>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="practice-soft-tile rounded-[1.2rem] px-4 py-4">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--practice-subtle)]">
            <MessageIcon className="h-3.5 w-3.5" />
            Your answer
          </p>
          <pre className="mt-2 whitespace-pre-wrap font-sans text-sm leading-6 text-[var(--practice-text)]">{question.userAnswer}</pre>
        </div>
        <div className="practice-soft-tile rounded-[1.2rem] px-4 py-4">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--practice-subtle)]">
            <CheckCircleIcon className="h-3.5 w-3.5" />
            Ideal answer
          </p>
          <pre className="mt-2 whitespace-pre-wrap font-sans text-sm leading-6 text-[var(--practice-text)]">{question.idealAnswer}</pre>
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <div className="practice-soft-tile rounded-[1.2rem] px-4 py-4">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--practice-subtle)]">
            <BookIcon className="h-3.5 w-3.5" />
            Explanation
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--practice-text)]">{question.explanation}</p>
        </div>
        <div className="practice-soft-tile rounded-[1.2rem] px-4 py-4">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--practice-subtle)]">
            <SparklesIcon className="h-3.5 w-3.5" />
            Improvement note
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--practice-text)]">{question.improvementNote}</p>
        </div>
      </div>
    </div>
  );
}
