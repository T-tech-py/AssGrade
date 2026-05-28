'use client';

import type { PracticeQuestionType } from '@/data/practice-mode';
import { SelectorTileGroup } from './selector-tile-group';

type QuestionTypeSelectorProps = {
  value: PracticeQuestionType;
  onChange: (value: PracticeQuestionType) => void;
  options: PracticeQuestionType[];
};

export function QuestionTypeSelector({ value, onChange, options }: QuestionTypeSelectorProps) {
  return (
    <SelectorTileGroup
      label="Question format"
      helper="Practice one format deeply or mix them to simulate a broader readiness workout."
      options={options}
      value={value}
      onChange={onChange}
      columns={4}
    />
  );
}
