import type { PracticeQuestion } from '@/data/practice-mode';
import type { PracticeQuestionFeedbackResponse } from '@/lib/practice-api';
import { BookmarkIcon, CheckCircleIcon, RefreshIcon, SparklesIcon } from './practice-icons';

type FeedbackCardProps = {
  question: PracticeQuestion;
  isCorrect?: boolean;
  feedback?: PracticeQuestionFeedbackResponse;
};

export function FeedbackCard({ question, isCorrect, feedback }: FeedbackCardProps) {
  const outcome = feedback?.outcome === 'Needs Improvement' ? false : isCorrect;
  const explanation = feedback?.explanation ?? question.explanation;
  const recommendedTopic = feedback?.recommendedTopic ?? question.recommendedTopic;
  const improvementNote = feedback?.improvementNote;
  const idealAnswer = feedback?.idealAnswer;

  return (
    <div className="practice-highlight rounded-[1.7rem] p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] ${
            outcome === false
              ? 'bg-[rgba(175,77,48,0.12)] text-[#a74a2b]'
              : 'bg-[rgba(76,164,106,0.14)] text-[#2e7b4b]'
          }`}
        >
          {outcome === false ? 'Needs improvement' : 'Strong direction'}
        </span>
        <span className="rounded-full bg-[rgba(255,255,255,0.6)] px-3 py-1.5 text-xs font-semibold text-[var(--practice-text)]">
          AI feedback
        </span>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <h3 className="text-lg font-semibold text-[var(--practice-text)]">Why this answer works</h3>
          <p className="mt-2 text-sm leading-7 text-[var(--practice-muted)]">{explanation}</p>
          <div className="mt-4 rounded-[1.2rem] bg-[rgba(255,255,255,0.54)] px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--practice-subtle)]">Key takeaway</p>
            <p className="mt-2 text-sm leading-6 text-[var(--practice-text)]">{improvementNote ?? question.takeaway}</p>
          </div>
        </div>

        <div className="space-y-3">
          {idealAnswer ? (
            <div className="rounded-[1.2rem] bg-[rgba(255,255,255,0.54)] px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--practice-subtle)]">Ideal answer</p>
              <p className="mt-2 text-sm leading-6 text-[var(--practice-text)]">{idealAnswer}</p>
            </div>
          ) : null}
          <div className="rounded-[1.2rem] bg-[rgba(255,255,255,0.54)] px-4 py-4">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--practice-subtle)]">
              <SparklesIcon className="h-3.5 w-3.5" />
              Recommended topic
            </p>
            <p className="mt-2 text-sm font-semibold text-[var(--practice-text)]">{recommendedTopic}</p>
          </div>

          {question.type === 'theory' ? (
            <>
              <div className="rounded-[1.2rem] bg-[rgba(255,255,255,0.54)] px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--practice-subtle)]">Strengths</p>
                <ul className="mt-2 space-y-2 text-sm leading-6 text-[var(--practice-text)]">
                  {question.feedback.strengths.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-[1.2rem] bg-[rgba(255,255,255,0.54)] px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--practice-subtle)]">Areas to improve</p>
                <ul className="mt-2 space-y-2 text-sm leading-6 text-[var(--practice-text)]">
                  {question.feedback.improvements.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p className="mt-3 text-sm leading-6 text-[var(--practice-text)]">{question.feedback.betterResponseTip}</p>
              </div>
            </>
          ) : null}

          {question.type === 'coding' ? (
            <>
              <div className="rounded-[1.2rem] bg-[rgba(255,255,255,0.54)] px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--practice-subtle)]">Logic quality</p>
                <p className="mt-2 text-sm leading-6 text-[var(--practice-text)]">{question.feedback.logicQuality}</p>
              </div>
              <div className="rounded-[1.2rem] bg-[rgba(255,255,255,0.54)] px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--practice-subtle)]">Code clarity</p>
                <p className="mt-2 text-sm leading-6 text-[var(--practice-text)]">{question.feedback.codeClarity}</p>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--practice-text)]">
                  {question.feedback.improvementSuggestions.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p className="mt-3 text-sm leading-6 text-[var(--practice-text)]">{question.feedback.modelApproach}</p>
              </div>
            </>
          ) : null}
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          className="practice-dark-button inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition hover:-translate-y-0.5"
        >
          <RefreshIcon className="h-4 w-4" />
          Generate Similar Question
        </button>
        <button
          type="button"
          className="practice-dark-button inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition hover:-translate-y-0.5"
        >
          <BookmarkIcon className="h-4 w-4" />
          Add to Study Plan
        </button>
      </div>
    </div>
  );
}
