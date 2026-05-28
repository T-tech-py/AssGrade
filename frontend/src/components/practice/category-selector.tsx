'use client';

import type { PracticeCategory } from '@/data/practice-mode';
import { SelectorTileGroup } from './selector-tile-group';

type CategorySelectorProps = {
  value: PracticeCategory;
  onChange: (value: PracticeCategory) => void;
  options: PracticeCategory[];
};

export function CategorySelector({ value, onChange, options }: CategorySelectorProps) {
  return (
    <SelectorTileGroup
      label="Field or category"
      helper="Choose the area you want your AI-guided practice to focus on."
      options={options}
      value={value}
      onChange={onChange}
    />
  );
}
