'use client';

import { startTransition, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getTopicsForCategory,
  practiceCategories,
  practiceDifficultyLevels,
  practiceQuestionCounts,
  practiceQuestionTypes,
  practiceStyles,
  practiceRecommendation,
  type PracticeCategory,
  type PracticeDifficulty,
  type PracticeQuestionType,
  type PracticeStyle,
} from '@/data/practice-mode';
import { generatePracticeSessionRequest } from '@/lib/practice-api';
import { setStoredPracticeSession, clearStoredPracticeReview } from '@/lib/practice-session-store';
import { emitAppToast } from '@/components/ui/app-toast';
import { CategorySelector } from './category-selector';
import { DifficultySelector } from './difficulty-selector';
import { QuestionTypeSelector } from './question-type-selector';
import { SelectorTileGroup } from './selector-tile-group';
import { TopicSelector } from './topic-selector';

type PracticeSetupCardProps = {
  defaults?: {
    category: PracticeCategory;
    topic: string;
    questionType: PracticeQuestionType;
    difficulty: PracticeDifficulty;
    questionCount: number;
    style: PracticeStyle;
  };
};

export function PracticeSetupCard({ defaults }: PracticeSetupCardProps) {
  const router = useRouter();
  const [category, setCategory] = useState<PracticeCategory>(
    defaults?.category ?? practiceRecommendation.category,
  );
  const [topic, setTopic] = useState(defaults?.topic ?? practiceRecommendation.topic);
  const [questionType, setQuestionType] = useState<PracticeQuestionType>(
    defaults?.questionType ?? practiceRecommendation.questionType,
  );
  const [difficulty, setDifficulty] = useState<PracticeDifficulty>(
    defaults?.difficulty ?? practiceRecommendation.difficulty,
  );
  const [questionCount, setQuestionCount] = useState<number>(
    defaults?.questionCount ?? practiceRecommendation.questionCount,
  );
  const [style, setStyle] = useState<PracticeStyle>(defaults?.style ?? practiceRecommendation.style);
  const [isLoading, setIsLoading] = useState(false);

  const topicOptions = getTopicsForCategory(category);

  useEffect(() => {
    if (!topicOptions.includes(topic)) {
      setTopic(topicOptions[0]);
    }
  }, [category, topic, topicOptions]);

  useEffect(() => {
    if (!defaults) return;
    setCategory(defaults.category);
    setTopic(defaults.topic);
    setQuestionType(defaults.questionType);
    setDifficulty(defaults.difficulty);
    setQuestionCount(defaults.questionCount);
    setStyle(defaults.style);
  }, [defaults]);

  const launchSession = async () => {
    setIsLoading(true);
    try {
      const response = await generatePracticeSessionRequest({
        category,
        topic,
        questionType,
        difficulty,
        questionCount,
        style,
      });

      setStoredPracticeSession(response);
      clearStoredPracticeReview();

      startTransition(() => {
        router.push(`/practice/session?sessionId=${response.sessionId}`);
      });
    } catch (error) {
      emitAppToast({
        title: 'Session generation failed',
        description:
          error instanceof Error
            ? error.message
            : 'We could not generate your practice session right now.',
        tone: 'error',
      });
      setIsLoading(false);
    }
  };

  const applyRecommendation = () => {
    setCategory(practiceRecommendation.category);
    setTopic(practiceRecommendation.topic);
    setQuestionType(practiceRecommendation.questionType);
    setDifficulty(practiceRecommendation.difficulty);
    setQuestionCount(practiceRecommendation.questionCount);
    setStyle(practiceRecommendation.style);
  };

  return (
    <div className="practice-panel-strong rounded-[2rem] p-5 sm:p-6 lg:p-7">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--practice-accent-foreground)]">Session setup</p>
          <h2 className="mt-2 text-[1.6rem] font-semibold tracking-[-0.04em] text-[var(--practice-text)]">
            Build a guided practice session
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--practice-muted)]">
            Adjust the session to match what you want to improve right now, or use the AI recommendation to start with a strong default.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <CategorySelector value={category} onChange={setCategory} options={practiceCategories} />
        <TopicSelector value={topic} onChange={setTopic} options={topicOptions} />
        <QuestionTypeSelector value={questionType} onChange={setQuestionType} options={practiceQuestionTypes} />
        <DifficultySelector value={difficulty} onChange={setDifficulty} options={practiceDifficultyLevels} />
        <SelectorTileGroup
          label="Number of questions"
          helper="Shorter sessions are great for focused improvement, while longer sets help build stamina."
          options={practiceQuestionCounts}
          value={questionCount}
          onChange={setQuestionCount}
          columns={4}
        />
        <SelectorTileGroup
          label="Practice style"
          helper="Choose whether you want coaching as you go or a full review once the session ends."
          options={practiceStyles}
          value={style}
          onChange={setStyle}
        />
      </div>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => void launchSession()}
          disabled={isLoading}
          className="dashboard-lime-panel inline-flex items-center justify-center rounded-2xl px-5 py-3.5 text-sm font-semibold text-[#223200] transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-80"
        >
          {isLoading ? 'Generating session...' : 'Generate Practice Session'}
        </button>
        <button
          type="button"
          onClick={applyRecommendation}
          className="practice-dark-button inline-flex items-center justify-center rounded-2xl px-5 py-3.5 text-sm font-semibold transition hover:-translate-y-0.5"
        >
          Use Recommended Setup
        </button>
      </div>
    </div>
  );
}
