import type { PracticeQuestion } from '@/data/practice-mode';
import { PracticeCoding } from './practice-coding';
import { PracticeMCQ } from './practice-mcq';
import { PracticeTheory } from './practice-theory';

type PracticeQuestionRendererProps = {
  question: PracticeQuestion;
  answer: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function PracticeQuestionRenderer({
  question,
  answer,
  onChange,
  disabled,
}: PracticeQuestionRendererProps) {
  if (question.type === 'mcq') {
    return <PracticeMCQ question={question} answer={answer} onChange={onChange} disabled={disabled} />;
  }

  if (question.type === 'theory') {
    return <PracticeTheory question={question} answer={answer} onChange={onChange} disabled={disabled} />;
  }

  return <PracticeCoding question={question} answer={answer} onChange={onChange} disabled={disabled} />;
}
