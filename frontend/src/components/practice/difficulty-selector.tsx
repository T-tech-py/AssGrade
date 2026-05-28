'use client';

import type { PracticeDifficulty } from '@/data/practice-mode';
import { SelectorTileGroup } from './selector-tile-group';

type DifficultySelectorProps = {
  value: PracticeDifficulty;
  onChange: (value: PracticeDifficulty) => void;
  options: PracticeDifficulty[];
};

export function DifficultySelector({ value, onChange, options }: DifficultySelectorProps) {
  return (
    <SelectorTileGroup
      label="Difficulty level"
      helper="Match the challenge to your current confidence, then raise it gradually as your weak areas improve."
      options={options}
      value={value}
      onChange={onChange}
      columns={3}
    />
  );
}
