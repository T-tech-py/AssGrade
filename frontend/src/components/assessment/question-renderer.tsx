import type { ExamQuestion } from '@/data/exam-assessments';
import { CodingQuestion } from './coding-question';
import { MCQQuestion } from './mcq-question';
import { TheoryQuestion } from './theory-question';

type QuestionRendererProps = {
  question: ExamQuestion;
  answer: string | undefined;
  onAnswerChange: (value: string) => void;
};

export function QuestionRenderer({ question, answer, onAnswerChange }: QuestionRendererProps) {
  if (question.type === 'mcq') {
    return <MCQQuestion options={question.options} value={answer} onChange={onAnswerChange} />;
  }

  if (question.type === 'theory') {
    return (
      <TheoryQuestion
        value={answer}
        onChange={onAnswerChange}
        placeholder={question.placeholder}
      />
    );
  }

  return (
    <CodingQuestion
      value={answer}
      onChange={onAnswerChange}
      language={question.language}
      starterCode={question.starterCode}
      sampleInput={question.sampleInput}
      sampleOutput={question.sampleOutput}
    />
  );
}
